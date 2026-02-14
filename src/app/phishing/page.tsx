"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import RiskBadge from "@/components/RiskBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { fetchJSON } from "@/lib/api";
import type { AnalyzeResponse } from "@/lib/types";

const GOVERNORATES = [
  "Muscat",
  "Dhofar",
  "Al Dakhiliyah",
  "Al Batinah North",
  "Al Batinah South",
  "Al Sharqiyah North",
  "Al Sharqiyah South",
  "Al Dhahirah",
  "Al Buraimi",
  "Al Wusta",
  "Musandam",
];

const THREAT_TYPES = [
  "Phishing",
  "Malware",
  "Scam",
  "Identity Theft",
  "Social Engineering",
  "Other",
];

export default function PhishingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState("");

  // Report modal
  const [modalOpen, setModalOpen] = useState(false);
  const [threatType, setThreatType] = useState(THREAT_TYPES[0]);
  const [governorate, setGovernorate] = useState(GOVERNORATES[0]);
  const [description, setDescription] = useState("");
  const [solution, setSolution] = useState("");
  const [reporting, setReporting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
      setToast({ type: "success", message: "Report submitted!" });
    } catch {
      setToast({ type: "error", message: "Failed to submit report." });
    } finally {
      setReporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Phishing Scanner"
        subtitle="Paste a URL to analyze it for phishing indicators."
      />

      {/* URL input */}
      <div className="flex gap-2">
        <label htmlFor="url-input" className="sr-only">
          URL
        </label>
        <input
          id="url-input"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {error && <Toast type="error" message={error} onDismiss={() => setError("")} />}

      {/* Results */}
      {result && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Results</h2>
            <RiskBadge label={result.label} />
          </div>

          <p className="mt-2 text-sm text-gray-600">
            Risk score: <span className="font-bold">{result.score}</span> / 100
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Reasons</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Advice</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                {result.advice.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Report this threat
          </button>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div className="mt-4">
          <Toast
            type={toast.type}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
          {toast.type === "success" && (
            <Link
              href="/reports"
              className="mt-2 inline-block text-sm text-blue-600 underline"
            >
              View reports →
            </Link>
          )}
        </div>
      )}

      {/* Report Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Report Threat
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="r-type" className="mb-1 block text-sm font-medium text-gray-700">
                  Threat Type
                </label>
                <select
                  id="r-type"
                  value={threatType}
                  onChange={(e) => setThreatType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                >
                  {THREAT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="r-gov" className="mb-1 block text-sm font-medium text-gray-700">
                  Governorate
                </label>
                <select
                  id="r-gov"
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                >
                  {GOVERNORATES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="r-desc" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="r-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="r-sol" className="mb-1 block text-sm font-medium text-gray-700">
                  Solution / Recommendation
                </label>
                <textarea
                  id="r-sol"
                  rows={2}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={reporting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {reporting ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
