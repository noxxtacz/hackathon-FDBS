"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  password: string;
}

interface AiAnalysis {
  security_score: number;
  strength_level: string;
  estimated_bruteforce_time: string;
  entropy_bits: number;
  main_weaknesses: string[];
  attack_risks: string[];
  improvement_suggestions: string[];
  professional_summary: string;
  charset_size: number;
  has_common_patterns: boolean;
  preliminary_score: number;
}

/* ── Quick local score for the instant bar ────────────────── */

function getLocalStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { level: "Weak", pct: 20, color: "bg-red-500", glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]" },
    { level: "Fair", pct: 40, color: "bg-orange-400", glow: "shadow-[0_0_8px_rgba(251,146,60,0.3)]" },
    { level: "Good", pct: 60, color: "bg-yellow-400", glow: "shadow-[0_0_8px_rgba(250,204,21,0.3)]" },
    { level: "Strong", pct: 80, color: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,0.3)]" },
    { level: "Very Strong", pct: 100, color: "bg-cyan-400", glow: "shadow-[0_0_8px_rgba(6,214,160,0.4)]" },
  ];

  const idx = Math.min(score, levels.length) - 1;
  return levels[Math.max(0, idx)];
}

/* ── AI strength colour for the score badge ───────────────── */

function scoreColor(score: number) {
  if (score >= 80) return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
  if (score >= 60) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (score >= 40) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  if (score >= 20) return "text-orange-400 border-orange-500/30 bg-orange-500/10";
  return "text-red-400 border-red-500/30 bg-red-500/10";
}

function strengthColor(level: string) {
  switch (level) {
    case "Very Strong": return "text-cyan-400";
    case "Strong": return "text-emerald-400";
    case "Moderate": return "text-yellow-400";
    case "Weak": return "text-orange-400";
    default: return "text-red-400";
  }
}

/* ── Component ────────────────────────────────────────────── */

export default function PasswordStrengthMeter({ password }: Props) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async (pw: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/password-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!controller.signal.aborted) {
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
        } else {
          setError(data.error || "Analysis failed");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Could not reach the analyzer");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!password || password.length < 1) {
      setAnalysis(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Debounce 600ms so we don't spam the API on every keystroke
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAnalysis(password), 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [password, fetchAnalysis]);

  if (!password) return null;

  const local = getLocalStrength(password);

  return (
    <div className="mt-3 space-y-3 animate-fade-in">
      {/* ─ Instant local bar ─ */}
      <div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${local.color} ${local.glow}`}
            style={{ width: `${local.pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Strength: <span className="font-semibold text-gray-300">{local.level}</span>
          </span>
          <span className="font-mono text-gray-600">{password.length} chars</span>
        </div>
      </div>

      {/* ─ Loading indicator ─ */}
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-400">
          <svg className="h-4 w-4 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          AI is analyzing your password…
        </div>
      )}

      {/* ─ Error ─ */}
      {error && !loading && (
        <p className="text-xs text-red-400/80">{error}</p>
      )}

      {/* ─ AI Analysis Results ─ */}
      {analysis && !loading && (
        <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          {/* Score + Strength header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold ${scoreColor(analysis.security_score)}`}>
                {analysis.security_score}
              </span>
              <span className={`text-sm font-semibold ${strengthColor(analysis.strength_level)}`}>
                {analysis.strength_level}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {analysis.entropy_bits.toFixed(1)} bits
            </span>
          </div>

          {/* Brute-force time */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimated crack time:&nbsp;
            <span className="font-semibold text-gray-300">{analysis.estimated_bruteforce_time}</span>
          </div>

          {/* Summary */}
          <p className="text-xs leading-relaxed text-gray-400">
            {analysis.professional_summary}
          </p>

          {/* Weaknesses */}
          {analysis.main_weaknesses.length > 0 && (
            <div>
              <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-red-400/70">
                Weaknesses
              </h4>
              <ul className="space-y-0.5 text-xs text-gray-400">
                {analysis.main_weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-red-400">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attack risks */}
          {analysis.attack_risks.length > 0 && (
            <div>
              <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-orange-400/70">
                Attack Risks
              </h4>
              <ul className="space-y-0.5 text-xs text-gray-400">
                {analysis.attack_risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-orange-400">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement suggestions */}
          {analysis.improvement_suggestions.length > 0 && (
            <div>
              <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400/70">
                Suggestions
              </h4>
              <ul className="space-y-0.5 text-xs text-gray-400">
                {analysis.improvement_suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-cyan-400">✦</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
