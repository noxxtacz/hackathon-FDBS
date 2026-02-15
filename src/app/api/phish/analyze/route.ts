/* ------------------------------------------------------------------
   POST /api/phish/analyze
   ------------------------------------------------------------------
   Accepts:
     A) JSON body  → { type: "url", url: string }
     B) FormData   → field "type" = "image", field "file" = File

   Security:
   - OCR text is never logged or persisted.
   - Returned extracted_text is truncated to 2 000 chars.
   - Secrets (OPENAI_API_KEY etc.) are never logged.
   ------------------------------------------------------------------ */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  normalizeUrl,
  extractUrlsFromText,
  analyzeUrlHeuristics,
  analyzeTextHeuristics,
  scoreFromSignals,
  type HeuristicSignal,
} from "@/lib/phish/heuristics";
import { ocrImage } from "@/lib/phish/ocr";
import { generatePhishReport, type PhishReport } from "@/lib/phish/groq";

/* ── Simple in-memory rate limiter (per IP, 10 req / min) ──── */

const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const hitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    hitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

/* ── Response shape ─────────────────────────────────────────── */

interface AnalyzeResponse {
  success: boolean;
  input_type?: "url" | "image";
  normalized_url?: string | null;
  extracted_text?: string;
  extracted_urls?: string[];
  heuristics?: { risk_score: number; signals: HeuristicSignal[] };
  ai_report?: PhishReport;
  error?: string;
}

/* ── Handler ────────────────────────────────────────────────── */

export async function POST(
  req: NextRequest
): Promise<NextResponse<AnalyzeResponse>> {
  // Rate-limit by forwarded IP or fallback
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests — try again in a minute" },
      { status: 429 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") ?? "";

    let inputType: "url" | "image";
    let url: string | null = null;
    let extractedText = "";
    let extractedUrls: string[] = [];
    const allSignals: HeuristicSignal[] = [];

    /* ── Branch A: JSON body (URL input) ───────────────────── */
    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body?.type !== "url" || typeof body?.url !== "string" || !body.url.trim()) {
        return NextResponse.json(
          { success: false, error: 'JSON body must be { type: "url", url: "<string>" }' },
          { status: 400 }
        );
      }

      inputType = "url";
      const normalized = normalizeUrl(body.url);
      if (!normalized) {
        return NextResponse.json(
          { success: false, error: "Invalid URL" },
          { status: 400 }
        );
      }
      url = normalized;
      extractedUrls = [normalized];

      // Run URL heuristics
      const urlSignals = analyzeUrlHeuristics(normalized);
      allSignals.push(...urlSignals);

    /* ── Branch B: multipart/form-data (image upload) ──────── */
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const typeField = formData.get("type");
      const file = formData.get("file");

      if (typeField !== "image" || !(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'Form must include type="image" and a file field' },
          { status: 400 }
        );
      }

      // Validate mime type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Uploaded file is not an image" },
          { status: 400 }
        );
      }

      inputType = "image";

      // Read buffer & run OCR
      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      extractedText = await ocrImage(buffer);

      // Pull URLs from OCR text
      extractedUrls = extractUrlsFromText(extractedText);

      // Heuristics on text
      const textSignals = analyzeTextHeuristics(extractedText);
      allSignals.push(...textSignals);

      // Heuristics on each extracted URL
      for (const eu of extractedUrls) {
        allSignals.push(...analyzeUrlHeuristics(eu));
      }

      // Use the first extracted URL as the "primary" URL for reporting
      if (extractedUrls.length > 0) url = extractedUrls[0];

    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported Content-Type. Use application/json or multipart/form-data." },
        { status: 400 }
      );
    }

    /* ── Common: score + AI report ─────────────────────────── */
    const riskScore = scoreFromSignals(allSignals);

    const aiReport = await generatePhishReport({
      inputType,
      url,
      extractedText,
      extractedUrls,
      heuristics: { riskScore, signals: allSignals },
    });

    return NextResponse.json({
      success: true,
      input_type: inputType,
      normalized_url: url,
      // Truncate OCR text in the response to prevent leaking sensitive content
      extracted_text: extractedText.slice(0, 2000),
      extracted_urls: extractedUrls,
      heuristics: { risk_score: riskScore, signals: allSignals },
      ai_report: aiReport,
    });
  } catch (err) {
    // Log only the error message, never the request payload
    console.error("[phish/analyze] Error:", (err as Error).message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
