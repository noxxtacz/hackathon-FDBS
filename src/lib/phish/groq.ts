/* ------------------------------------------------------------------
   Groq LLM caller — phishing analysis report
   ------------------------------------------------------------------
   Security:
   - Password / OCR text is sent only to Groq; never logged server-side.
   - Response is parsed defensively; values clamped to safe ranges.
   ------------------------------------------------------------------ */

import type { HeuristicSignal } from "./heuristics";

/* ── Public types ───────────────────────────────────────────── */

export interface PhishReport {
  overall_risk: "Low" | "Medium" | "High" | "Critical";
  risk_score: number;          // 0-100
  summary: string;
  key_findings: string[];
  red_flags: string[];
  recommended_actions: string[];
  user_education: {
    why_this_is_suspicious: string[];
    how_to_verify_safely: string[];
  };
  safe_reply_template: string;
  confidence: number;          // 0-1
}

/** @deprecated Use PhishReport instead */
export type GroqPhishReport = PhishReport;

export interface PhishReportInput {
  inputType: "url" | "image";
  url: string | null;
  extractedText: string;
  extractedUrls: string[];
  heuristics: {
    riskScore: number;
    signals: HeuristicSignal[];
  };
}

/* ── Model config ───────────────────────────────────────────── */

const GROQ_MODEL =
  process.env.GROQ_PHISH_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/* ── Prompts ────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are a senior cybersecurity analyst specializing in phishing detection.
Analyze the submitted content and produce a structured JSON report.
Be cautious: it is better to over-warn than to miss a real phishing attempt.
Return ONLY valid JSON — no markdown, no code fences, no prose outside the JSON object.`;

function buildUserPrompt(input: PhishReportInput): string {
  // Truncate extracted text to avoid prompt-injection surface & token blow-up
  const safeText = (input.extractedText ?? "").slice(0, 3000);

  return `Analyze the following for phishing indicators.

Input type: ${input.inputType}
${input.url ? `Submitted URL: ${input.url}` : ""}
${safeText ? `Extracted text (may be from OCR):\n"""\n${safeText}\n"""` : ""}
${input.extractedUrls.length > 0 ? `URLs found in content: ${input.extractedUrls.join(", ")}` : ""}

Heuristic pre-scan:
- Risk score: ${input.heuristics.riskScore}/100
- Signals: ${JSON.stringify(input.heuristics.signals.map((s) => s.message))}

Return JSON matching this exact schema:
{
  "overall_risk": "Low" | "Medium" | "High" | "Critical",
  "risk_score": <number 0-100>,
  "summary": "<string: 1-3 sentence executive summary>",
  "key_findings": ["<string>", ...],
  "red_flags": ["<string>", ...],
  "recommended_actions": ["<string>", ...],
  "user_education": {
    "why_this_is_suspicious": ["<string>", ...],
    "how_to_verify_safely": ["<string>", ...]
  },
  "safe_reply_template": "<string: a safe way for the user to respond if this was a message>",
  "confidence": <number 0-1>
}`;
}

/* ── Groq API call ──────────────────────────────────────────── */

export async function generatePhishReport(
  input: PhishReportInput
): Promise<PhishReport> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.25,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    // Intentionally not logging the response body (may echo input)
    throw new Error(`Groq API responded with HTTP ${res.status}`);
  }

  const data = await res.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? "";

  // ── Parse & validate ─────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  const report = parsed as unknown as PhishReport;

  // Clamp numeric fields to safe ranges
  report.risk_score = clamp(Number(report.risk_score) || 0, 0, 100);
  report.confidence = clamp(Number(report.confidence) || 0, 0, 1);

  // Ensure arrays
  report.key_findings = asStringArray(report.key_findings);
  report.red_flags = asStringArray(report.red_flags);
  report.recommended_actions = asStringArray(report.recommended_actions);

  if (!report.user_education || typeof report.user_education !== "object") {
    report.user_education = { why_this_is_suspicious: [], how_to_verify_safely: [] };
  }
  report.user_education.why_this_is_suspicious = asStringArray(
    report.user_education.why_this_is_suspicious
  );
  report.user_education.how_to_verify_safely = asStringArray(
    report.user_education.how_to_verify_safely
  );

  // Validate overall_risk enum
  const VALID_RISK = ["Low", "Medium", "High", "Critical"] as const;
  if (!VALID_RISK.includes(report.overall_risk as (typeof VALID_RISK)[number])) {
    report.overall_risk = report.risk_score >= 75 ? "Critical"
      : report.risk_score >= 50 ? "High"
      : report.risk_score >= 25 ? "Medium"
      : "Low";
  }

  return report;
}

/* ── Helpers ────────────────────────────────────────────────── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  return [];
}
