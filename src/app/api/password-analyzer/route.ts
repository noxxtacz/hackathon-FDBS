import { NextRequest, NextResponse } from "next/server";
import {
  calculateEntropy,
  estimateBruteForceTime,
  calculateCharsetSize,
  detectCommonPatterns,
  calculatePreliminaryScore,
} from "@/lib/passwordAnalysis";

/* ── Groq response shape ────────────────────────────────────── */

interface GroqAnalysis {
  security_score: number;
  strength_level: string;
  estimated_bruteforce_time: string;
  entropy_bits: number;
  main_weaknesses: string[];
  attack_risks: string[];
  improvement_suggestions: string[];
  professional_summary: string;
}

interface ApiResponse {
  success: boolean;
  analysis?: GroqAnalysis & {
    charset_size: number;
    has_common_patterns: boolean;
    preliminary_score: number;
  };
  error?: string;
}

/* ── Groq caller ────────────────────────────────────────────── */

async function callGroq(password: string, entropy: number): Promise<GroqAnalysis> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const systemPrompt = `You are a cybersecurity expert specializing in password security analysis.
Return only valid JSON. Be realistic about brute-force times.
Assume modern GPU cracking capabilities (10^10 guesses/sec).`;

  const userPrompt = `Analyze the password:
"${password}"

The calculated entropy is: ${entropy} bits.

Return JSON in this exact format:
{
  "security_score": number (0-100),
  "strength_level": "Very Weak | Weak | Moderate | Strong | Very Strong",
  "estimated_bruteforce_time": "string",
  "entropy_bits": number,
  "main_weaknesses": ["string"],
  "attack_risks": ["string"],
  "improvement_suggestions": ["string"],
  "professional_summary": "string"
}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";

  // Parse the JSON from Groq's response
  const parsed = JSON.parse(content) as GroqAnalysis;
  return parsed;
}

/* ── Route handler ──────────────────────────────────────────── */

/**
 * POST /api/password-analyzer
 * Body: { password: string }
 *
 * Calculates local entropy & patterns, then sends to Groq for
 * AI-powered analysis. Never logs or stores the password.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();
    const password: unknown = body?.password;

    // Input validation
    if (typeof password !== "string" || password.length < 1) {
      return NextResponse.json(
        { success: false, error: "Password is required (min 1 character)" },
        { status: 400 }
      );
    }

    // Local analysis
    const entropy = calculateEntropy(password);
    const charsetSize = calculateCharsetSize(password);
    const hasCommonPatterns = detectCommonPatterns(password);
    const preliminaryScore = calculatePreliminaryScore(password);
    const localBruteForce = estimateBruteForceTime(entropy);

    // AI analysis via Groq
    let groqAnalysis: GroqAnalysis;
    try {
      groqAnalysis = await callGroq(password, entropy);
    } catch (groqErr) {
      // Fallback: return local-only analysis if Groq fails
      console.error("[password-analyzer] Groq error:", groqErr);

      const strengthLevel =
        preliminaryScore >= 80 ? "Very Strong" :
        preliminaryScore >= 60 ? "Strong" :
        preliminaryScore >= 40 ? "Moderate" :
        preliminaryScore >= 20 ? "Weak" : "Very Weak";

      groqAnalysis = {
        security_score: preliminaryScore,
        strength_level: strengthLevel,
        estimated_bruteforce_time: localBruteForce,
        entropy_bits: entropy,
        main_weaknesses: hasCommonPatterns ? ["Contains common patterns"] : [],
        attack_risks: preliminaryScore < 40 ? ["Vulnerable to dictionary attacks"] : [],
        improvement_suggestions: [
          "Use at least 12 characters",
          "Mix uppercase, lowercase, numbers, and symbols",
          "Avoid dictionary words and sequences",
        ],
        professional_summary: `Local analysis only (AI unavailable). Entropy: ${entropy} bits. Estimated crack time: ${localBruteForce}.`,
      };
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...groqAnalysis,
        charset_size: charsetSize,
        has_common_patterns: hasCommonPatterns,
        preliminary_score: preliminaryScore,
      },
    });
  } catch (err) {
    console.error("[password-analyzer]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
