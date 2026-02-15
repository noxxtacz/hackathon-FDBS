/* ------------------------------------------------------------------
   OpenAI (ChatGPT) caller — phishing analysis report
   ------------------------------------------------------------------
   Uses the official OpenAI SDK with STRICT JSON schema enforcement
   via response_format: { type: "json_schema", json_schema: { strict: true } }.

   Security:
   - OCR text / URLs are sent only to OpenAI; never logged server-side.
   - Response is parsed defensively; values clamped to safe ranges.
   - OPENAI_API_KEY is read from env; never printed.
   ------------------------------------------------------------------ */

import OpenAI from "openai";
import type { HeuristicSignal } from "./heuristics";

/* ── Public types (match the strict JSON schema exactly) ───── */

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

/* ── Strict JSON schema (OpenAI enforced) ──────────────────── */

const PHISH_REPORT_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "phish_report",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        overall_risk: {
          type: "string",
          enum: ["Low", "Medium", "High", "Critical"],
        },
        risk_score: {
          type: "number",
        },
        summary: {
          type: "string",
        },
        key_findings: {
          type: "array",
          items: { type: "string" },
        },
        red_flags: {
          type: "array",
          items: { type: "string" },
        },
        recommended_actions: {
          type: "array",
          items: { type: "string" },
        },
        user_education: {
          type: "object",
          additionalProperties: false,
          properties: {
            why_this_is_suspicious: {
              type: "array",
              items: { type: "string" },
            },
            how_to_verify_safely: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["why_this_is_suspicious", "how_to_verify_safely"],
        },
        safe_reply_template: {
          type: "string",
        },
        confidence: {
          type: "number",
        },
      },
      required: [
        "overall_risk",
        "risk_score",
        "summary",
        "key_findings",
        "red_flags",
        "recommended_actions",
        "user_education",
        "safe_reply_template",
        "confidence",
      ],
    },
  },
};

/* ── Model config ───────────────────────────────────────────── */

const OPENAI_MODEL = process.env.OPENAI_PHISH_MODEL ?? "gpt-4o-mini";

/* ── Prompts ────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are a senior cybersecurity analyst specializing in phishing detection.
Analyze the submitted content and produce a structured phishing report.
Be cautious: it is better to over-warn than to miss a real phishing attempt.
Never output markdown — only structured JSON matching the provided schema.
Set risk_score between 0 and 100. Set confidence between 0 and 1.`;

function buildUserPrompt(input: PhishReportInput): string {
  // Truncate extracted text to avoid prompt-injection surface & token blow-up
  const safeText = (input.extractedText ?? "").slice(0, 3000);

  return `Analyze the following for phishing indicators.

Input type: ${input.inputType}
${input.url ? `Submitted URL: ${input.url}` : ""}
${safeText ? `Extracted text (may be from OCR):\n"""\n${safeText}\n"""` : ""}
${input.extractedUrls.length > 0 ? `URLs found in content: ${input.extractedUrls.join(", ")}` : ""}

Heuristic pre-scan results:
- Risk score: ${input.heuristics.riskScore}/100
- Signals: ${JSON.stringify(input.heuristics.signals.map((s) => s.message))}`;
}

/* ── OpenAI API call ────────────────────────────────────────── */

export async function generatePhishReport(
  input: PhishReportInput
): Promise<PhishReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    response_format: PHISH_REPORT_SCHEMA,
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";

  // Parse — should always be valid because of strict schema, but defend anyway
  let report: PhishReport;
  try {
    report = JSON.parse(raw) as PhishReport;
  } catch {
    throw new Error("OpenAI returned unparseable response despite strict schema");
  }

  // Defensive clamps (belt-and-suspenders)
  report.risk_score = clamp(Number(report.risk_score) || 0, 0, 100);
  report.confidence = clamp(Number(report.confidence) || 0, 0, 1);

  return report;
}

/* ── Helpers ────────────────────────────────────────────────── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
