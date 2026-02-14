"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import Button from "@/components/Button";
import RiskBadge from "@/components/RiskBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import { fetchJSON } from "@/lib/api";
import type { AnalyzeResponse } from "@/lib/types";

const GOVERNORATES = [
  "Muscat", "Dhofar", "Al Dakhiliyah", "Al Batinah North", "Al Batinah South",
  "Al Sharqiyah North", "Al Sharqiyah South", "Al Dhahirah", "Al Buraimi",
  "Al Wusta", "Musandam",
];

const THREAT_TYPES = [
  "Phishing", "Malware", "Scam", "Identity Theft", "Social Engineering", "Other",
];

export default function PhishingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [threatType, setThreatType] = useState(THREAT_TYPES[0]);
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [description, setDescription] = useState("");
  const [solution, setSolution] = useState("");
  const [reporting, setReporting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function analyze() {
    if (!url.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await fetchJSON<AnalyzeResponse>("/api/analyze/url", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitReport() {
    if (!result) return;
    setReporting(true);
    try {
      await fetchJSON("/api/reports/create", {
        method: "POST",
        body: JSON.stringify({
          threat_type: threatType,
          governorate,
          description,
          solution,
          defanged_url: result.defanged_url,
          risk_score: result.score,
          risk_label: result.label,
          reasons: result.reasons,
        }),
      });
      setModalOpen(false);
      setToast({ type: "success", message: "Report submitted successfully!" });
    } catch {
      setToast({ type: "error", message: "Failed to submit report." });
    } finally {
      setReporting(false);
    }
  }

  const scoreColor = result
    ? result.label === "safe"
      ? "text-emerald-400 border-emerald-500/30"
      : result.label === "suspicious"
      ? "text-yellow-400 border-yellow-500/30"
      : "text-red-400 border-red-500/30"
    : "";

  const selectClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";

  const textareaClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 placeholder-gray-600 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";

  return (
    <>
      <PageHeader
        title="Phishing Scanner"
        subtitle="Paste a URL to analyze it for phishing indicators."
      />

      {/* URL Input */}
      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="url-input" className="sr-only">URL</label>
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <input
              id="url-input"
              type="url"
              placeholder="https://suspicious-site.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-gray-200 placeholder-gray-600 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <Button onClick={analyze} disabled={loading} className="sm:px-8">
            {loading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950" /> Analyzing…</>
            ) : (
              <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> Analyze</>
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

      {/* Results */}
      {result && (
        <Card className="animate-slide-up">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Score circle */}
            <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
              <div className={`flex h-24 w-24 items-center justify-center rounded-full border-2 ${scoreColor}`}>
                <span className={`text-3xl font-bold ${scoreColor.split(" ")[0]}`}>
                  {result.score}
                </span>
              </div>
              <div className="mt-3">
                <RiskBadge label={result.label} />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Reasons
                  </h3>
                  <ul className="space-y-1.5">
                    {result.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-600" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                    <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Advice
                  </h3>
                  <ul className="space-y-1.5">
                    {result.advice.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500/50" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="danger" onClick={() => setModalOpen(true)}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                  Report this threat
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div className="mt-4">
          <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
          {toast.type === "success" && (
            <Link href="/reports" className="mt-2 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              View reports <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}
        </div>
      )}

      {/* Report Modal */}
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
