"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";

/* ── Types matching /api/phish/analyze response ─────────────── */

interface HeuristicSignal {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
}

interface PhishAiReport {
  overall_risk: "Low" | "Medium" | "High" | "Critical";
  risk_score: number;
  summary: string;
  key_findings: string[];
  red_flags: string[];
  recommended_actions: string[];
  user_education: {
    why_this_is_suspicious: string[];
    how_to_verify_safely: string[];
  };
  safe_reply_template: string;
  confidence: number;
}

interface AnalyzeResult {
  success: boolean;
  input_type: "url" | "image";
  normalized_url: string | null;
  extracted_text?: string;
  extracted_urls: string[];
  heuristics: { risk_score: number; signals: HeuristicSignal[] };
  ai_report: PhishAiReport;
  error?: string;
}

const GOVERNORATES = [
  "Tunis","Ariana","Ben Arous","Manouba","Nabeul","Zaghouan","Bizerte",
  "Béja","Jendouba","Kef","Siliana","Sousse","Monastir","Mahdia",
  "Sfax","Kairouan","Kasserine","Sidi Bouzid","Gabès","Médenine",
  "Tataouine","Gafsa","Tozeur","Kébili",
];

const THREAT_TYPES = [
  "Phishing", "Malware", "Scam", "Identity Theft", "Social Engineering", "Other",
];

/* ── Colours ────────────────────────────────────────────────── */

function riskColour(risk: string) {
  switch (risk) {
    case "Critical": return { text: "text-red-400", border: "border-red-500/40", bg: "bg-red-500/10" };
    case "High":     return { text: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/10" };
    case "Medium":   return { text: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10" };
    default:         return { text: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/10" };
  }
}

function severityDot(sev: string) {
  if (sev === "high") return "bg-red-400";
  if (sev === "medium") return "bg-yellow-400";
  return "bg-gray-400";
}

/* ── Component ──────────────────────────────────────────────── */

export default function PhishingPage() {
  // Input state
  const [url, setUrl] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "image">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState("");

  // Report modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [threatType, setThreatType] = useState(THREAT_TYPES[0]);
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [description, setDescription] = useState("");
  const [solution, setSolution] = useState("");
  const [reporting, setReporting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  /* ── Analyze handler ─────────────────────────────────────── */

  async function analyze() {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let res: Response;

      if (inputMode === "url") {
        if (!url.trim()) { setLoading(false); return; }
        res = await fetch("/api/phish/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "url", url }),
        });
      } else {
        if (!selectedFile) { setLoading(false); return; }
        const form = new FormData();
        form.append("type", "image");
        form.append("file", selectedFile);
        res = await fetch("/api/phish/analyze", {
          method: "POST",
          body: form,
        });
      }

      const data: AnalyzeResult = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || `Analysis failed (${res.status})`);
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  /* ── Report handler ──────────────────────────────────────── */

  async function submitReport() {
    if (!result) return;
    setReporting(true);
    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threat_type: threatType,
          governorate,
          description,
          solution,
          url: result.normalized_url ?? undefined,
          risk_score: result.ai_report.risk_score,
          risk_label: result.ai_report.overall_risk === "Critical"
            ? "dangerous"
            : result.ai_report.overall_risk === "High"
              ? "dangerous"
              : result.ai_report.overall_risk === "Medium"
                ? "suspicious"
                : "safe",
          risk_reasons: result.ai_report.red_flags,
        }),
      });

      if (res.status === 401) {
        setToast({ type: "error", message: "You must be logged in to submit a report." });
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: data.error ?? "Failed to submit report." });
        return;
      }

      setModalOpen(false);
      setToast({ type: "success", message: "Report submitted successfully!" });
    } catch {
      setToast({ type: "error", message: "Failed to submit report." });
    } finally {
      setReporting(false);
    }
  }

  /* ── Derived ─────────────────────────────────────────────── */
  const ai = result?.ai_report;
  const rc = ai ? riskColour(ai.overall_risk) : null;

  const selectClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";
  const textareaClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 placeholder-gray-600 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";

  return (
    <>
      <PageHeader
        title="Phishing Scanner"
        subtitle="Paste a URL or upload a screenshot to analyze for phishing indicators."
      />

      {/* ── Input Card ──────────────────────────────────────── */}
      <Card className="mb-6">
        {/* Mode toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setInputMode("url")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              inputMode === "url"
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            URL
          </button>
          <button
            onClick={() => setInputMode("image")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              inputMode === "image"
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-white/5 text-gray-500 hover:text-gray-300"
            }`}
          >
            Screenshot
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {inputMode === "url" ? (
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="url"
                placeholder="https://suspicious-site.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-600 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-gray-400 transition hover:border-cyan-500/30 hover:text-gray-300"
              >
                {selectedFile ? selectedFile.name : "Choose screenshot…"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <Button onClick={analyze} disabled={loading} className="sm:px-8">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950" />
                Analyzing…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Analyze
              </>
            )}
          </Button>
        </div>
      </Card>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="mb-4">
          <Toast type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}

      {/* ── AI Report Result ────────────────────────────────── */}
      {ai && rc && (
        <div className="animate-slide-up space-y-5">
          {/* Risk header */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 ${rc.border} ${rc.bg}`}>
                  <span className={`text-3xl font-bold ${rc.text}`}>{ai.risk_score}</span>
                </div>
                <div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${rc.bg} ${rc.text} ${rc.border} border`}>
                    {ai.overall_risk}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    Confidence: {(ai.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <Button variant="danger" onClick={() => setModalOpen(true)}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Report Threat
              </Button>
            </div>

            {/* Summary */}
            <p className="mt-4 text-sm leading-relaxed text-gray-300">{ai.summary}</p>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Key Findings */}
            {ai.key_findings.length > 0 && (
              <Card>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Key Findings
                </h3>
                <ul className="space-y-1.5">
                  {ai.key_findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400/60" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Red Flags */}
            {ai.red_flags.length > 0 && (
              <Card>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Red Flags
                </h3>
                <ul className="space-y-1.5">
                  {ai.red_flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400/60" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Recommended Actions */}
            {ai.recommended_actions.length > 0 && (
              <Card>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recommended Actions
                </h3>
                <ul className="space-y-1.5">
                  {ai.recommended_actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400/60" />
                      {a}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Heuristic Signals */}
            {result!.heuristics.signals.length > 0 && (
              <Card>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-200">
                  <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Heuristic Signals
                  <span className="ml-auto text-xs text-gray-500">
                    Score: {result!.heuristics.risk_score}/100
                  </span>
                </h3>
                <ul className="space-y-1.5">
                  {result!.heuristics.signals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${severityDot(s.severity)}`} />
                      {s.message}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Education section */}
          {(ai.user_education.why_this_is_suspicious.length > 0 ||
            ai.user_education.how_to_verify_safely.length > 0) && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-gray-200">
                🎓 Learn — Stay Safe
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {ai.user_education.why_this_is_suspicious.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-400/70">
                      Why this is suspicious
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      {ai.user_education.why_this_is_suspicious.map((w, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-0.5 text-orange-400">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ai.user_education.how_to_verify_safely.length > 0 && (
                  <div>
                    <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400/70">
                      How to verify safely
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-400">
                      {ai.user_education.how_to_verify_safely.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="mt-0.5 text-cyan-400">✦</span> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Safe reply template */}
          {ai.safe_reply_template && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-gray-200">
                Safe Reply Template
              </h3>
              <p className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm italic text-gray-400">
                &ldquo;{ai.safe_reply_template}&rdquo;
              </p>
            </Card>
          )}

          {/* Extracted URLs (if from image) */}
          {result!.input_type === "image" && result!.extracted_urls.length > 0 && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-gray-200">
                URLs Extracted from Screenshot
              </h3>
              <ul className="space-y-1 text-xs font-mono text-gray-500">
                {result!.extracted_urls.map((u, i) => (
                  <li key={i} className="truncate">{u}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className="mt-4">
          <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
          {toast.type === "success" && (
            <Link href="/reports" className="mt-2 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              View reports
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* ── Report Modal ────────────────────────────────────── */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Report Threat">
        <div className="space-y-4">
          <div>
            <label htmlFor="r-type" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Threat Type</label>
            <select id="r-type" value={threatType} onChange={(e) => setThreatType(e.target.value)} className={selectClass}>
              {THREAT_TYPES.map((t) => (<option key={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="r-gov" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Governorate</label>
            <select id="r-gov" value={governorate} onChange={(e) => setGovernorate(e.target.value)} className={selectClass}>
              {GOVERNORATES.map((g) => (<option key={g}>{g}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="r-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Description</label>
            <textarea id="r-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={textareaClass} placeholder="Describe the threat…" />
          </div>
          <div>
            <label htmlFor="r-sol" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Solution / Recommendation</label>
            <textarea id="r-sol" rows={2} value={solution} onChange={(e) => setSolution(e.target.value)} className={textareaClass} placeholder="Suggest a solution…" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={submitReport} disabled={reporting}>
            {reporting ? "Submitting…" : "Submit Report"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
