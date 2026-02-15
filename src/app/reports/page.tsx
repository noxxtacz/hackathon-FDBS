"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import ReportCard from "@/components/ReportCard";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import type { ThreatReport } from "@/lib/types";

const GOVERNORATES = [
  "Tunis","Ariana","Ben Arous","Manouba","Nabeul","Zaghouan","Bizerte",
  "Béja","Jendouba","Le Kef","Siliana","Sousse","Monastir","Mahdia",
  "Sfax","Kairouan","Kasserine","Sidi Bouzid","Gabès","Médenine",
  "Tataouine","Gafsa","Tozeur","Kébili",
];

const THREAT_TYPES = [
  "Phishing", "Malware", "Scam", "Identity Theft", "Social Engineering", "Other",
];

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 backdrop-blur focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all";

export default function ReportsPage() {
  const [govFilter, setGovFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (govFilter) params.set("governorate", govFilter);
      if (typeFilter) params.set("threat_type", typeFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/reports/list?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to load reports");
        return;
      }

      setReports(data.reports ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [govFilter, typeFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [govFilter, typeFilter]);

  /* ── Vote handler ──────────────────────────────────────── */
  async function handleVote(reportId: string) {
    try {
      const res = await fetch("/api/reports/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: reportId }),
      });

      if (res.status === 401) {
        setError("Login required to vote");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Vote failed");
        return;
      }

      // Update the report in state
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, vote_count: data.vote_count, user_voted: data.voted }
            : r
        )
      );
    } catch {
      setError("Vote failed");
    }
  }

  return (
    <>
      <PageHeader
        title="Threat Reports"
        subtitle="Browse crowdsourced threat intelligence from the AmanTN community."
      />

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="gov-filter" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
            Governorate
          </label>
          <select
            id="gov-filter"
            value={govFilter}
            onChange={(e) => setGovFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Governorates</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type-filter" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
            Threat Type
          </label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Types</option>
            {THREAT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <Link
          href="/phishing"
          className="ml-auto flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Report
        </Link>
      </div>

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div className="mb-4">
          <Toast type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────── */}
      {loading && <LoadingSpinner />}

      {/* ── Empty State ──────────────────────────────────── */}
      {!loading && reports.length === 0 && (
        <Card className="flex flex-col items-center py-16 text-center">
          <svg className="mb-4 h-12 w-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No reports match your filters.</p>
          <p className="mt-1 text-xs text-gray-600">
            Be the first — <Link href="/phishing" className="text-cyan-400 hover:text-cyan-300 transition-colors">analyze a threat</Link> and submit a report.
          </p>
        </Card>
      )}

      {/* ── Reports Grid ─────────────────────────────────── */}
      {!loading && reports.length > 0 && (
        <>
          <div className="mb-3 text-xs text-gray-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} reports
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((r) => (
              <ReportCard key={r.id} report={r} onVote={handleVote} />
            ))}
          </div>

          {/* ── Pagination ─────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      p === page
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
