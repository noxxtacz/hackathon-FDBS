/* ------------------------------------------------------------------
   Quiz Game — Groq-powered question generation from reports
   ------------------------------------------------------------------
   Uses the Groq OpenAI-compatible API to turn real phishing report
   data into scenario-based quiz questions.

   Security:
   - Report text is truncated to 500 chars before inclusion in prompt
   - Real domains are bracketed (e.g. paypal[.]com)
   - Output is validated with zod; invalid JSON falls back gracefully
   ------------------------------------------------------------------ */

import { GroqQuestionsSchema, type QuizQuestion, type Topic, type Difficulty } from "./schemas";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_QUIZ_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";

export interface ReportSummary {
  id: string;
  urlSnippet: string | null;     // defanged URL or null
  textSnippet: string;           // max 500 chars, sanitised
  riskScore: number;
  overallRisk: string;           // Low / Medium / High / Critical
  redFlags: string[];
  threatType: string;
}

/**
 * Sanitise report data before injecting into the LLM prompt.
 * - Truncate text to 500 chars
 * - Bracket real-looking domains
 */
function sanitiseSnippet(text: string): string {
  return text
    .slice(0, 500)
    .replace(/([a-zA-Z0-9-]+)\.(com|net|org|io|tk|xyz|info)/g, "$1[.]$2");
}

function buildPrompt(
  reports: ReportSummary[],
  count: number,
  topic?: Topic,
  difficulty?: Difficulty
): string {
  const reportBlock = reports
    .map(
      (r, i) =>
        `Report ${i + 1}:\n` +
        `  URL: ${r.urlSnippet ?? "N/A"}\n` +
        `  Text: ${sanitiseSnippet(r.textSnippet)}\n` +
        `  Risk: ${r.overallRisk} (${r.riskScore}/100)\n` +
        `  Red flags: ${r.redFlags.slice(0, 5).join("; ")}\n` +
        `  Type: ${r.threatType}`
    )
    .join("\n\n");

  const topicHint = topic ? `Focus on the topic "${topic}".` : "";
  const diffHint = difficulty ? `Target difficulty: ${difficulty}.` : "";

  return `You are a cybersecurity educator creating quiz questions from real phishing analysis reports.

Given the reports below, generate exactly ${count} multiple-choice questions.
Each question must:
- Be based on one or more of the report findings
- Have exactly 4 options (one correct, three plausible distractors)
- Include a short explanation of why the correct answer is right
- Include a practical safety tip
- NOT reveal raw user data, real email addresses, or full URLs

${topicHint}
${diffHint}

REPORTS:
${reportBlock}

Return ONLY a JSON array. No markdown, no code fences, no extra text.
Each element must have exactly these keys:
  "question": string,
  "options": [string, string, string, string],
  "correctIndex": 0|1|2|3,
  "explanation": string,
  "tip": string

Example:
[{"question":"...","options":["A","B","C","D"],"correctIndex":1,"explanation":"...","tip":"..."}]`;
}

/**
 * Call Groq to generate quiz questions from report summaries.
 * Returns validated QuizQuestion[] or empty array on failure.
 */
export async function generateQuestionsFromReports(params: {
  reports: ReportSummary[];
  count: number;
  topic?: Topic;
  difficulty?: Difficulty;
}): Promise<QuizQuestion[]> {
  if (!GROQ_API_KEY || params.reports.length === 0 || params.count === 0) {
    return [];
  }

  try {
    const prompt = buildPrompt(
      params.reports,
      params.count,
      params.topic,
      params.difficulty
    );

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a cybersecurity quiz generator. Output ONLY valid JSON arrays. Never include markdown or explanation outside the JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      console.error("[quiz/groq] Groq API error:", res.status);
      return [];
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";

    // Extract JSON array from response (handles code fences)
    const jsonStr = extractJson(raw);
    if (!jsonStr) {
      console.error("[quiz/groq] Could not extract JSON from Groq response");
      return [];
    }

    const parsed = JSON.parse(jsonStr);
    const validated = GroqQuestionsSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("[quiz/groq] Zod validation failed:", validated.error.issues.slice(0, 3));
      return [];
    }

    // Map to full QuizQuestion type
    return validated.data.slice(0, params.count).map((q) => ({
      ...q,
      source: "report_generated" as const,
      reportId: params.reports[0]?.id ?? null,
      topic: params.topic ?? "general",
      difficulty: params.difficulty ?? "medium",
    }));
  } catch (err) {
    console.error("[quiz/groq] Failed to generate questions:", (err as Error).message);
    return [];
  }
}

/**
 * Extract a JSON array from a possibly-wrapped LLM response.
 * Handles ```json ... ``` fences and leading/trailing text.
 */
function extractJson(raw: string): string | null {
  // Try stripping code fences
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  // Try finding a raw array
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (arrMatch) return arrMatch[0];

  return null;
}
