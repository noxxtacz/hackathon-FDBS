"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

const TunisiaHeatMap = dynamic(() => import("@/components/TunisiaHeatMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
      <LoadingSpinner />
    </div>
  ),
});

/* ── Types ──────────────────────────────────────────────────── */

interface DashboardLastReport {
  id: string;
  createdAt: string;
  normalizedUrl: string | null;
  overallRisk: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
}

interface DashboardSummary {
  success: true;
  user: { name?: string };
  vault: { isUnlocked: boolean };
  phishing: {
    analyzedCount: number;
    reportedCount: number;
    highRiskCount: number;
    lastReports: DashboardLastReport[];
  };
  quiz: {
    dailyStreak: { current: number; best: number };
    answerStreak: { current: number; best: number };
    totalSessions: number;
    lastSession: {
      percent: number;
      correct: number;
      total: number;
      completedAt: string;
    } | null;
  };
}

/* ── Helpers ─────────────────────────────────────────────────── */

const riskColor: Record<DashboardLastReport["overallRisk"], string> = {
  Low: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  Medium: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10",
  High: "text-orange-400 border-orange-500/20 bg-orange-500/10",
  Critical: "text-red-400 border-red-500/20 bg-red-500/10",
};

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function domainFromUrl(url: string | null): string {
  if (!url) return "—";
  try {
    // defanged urls have [.] — normalize for display
    const cleaned = url.replace(/\[.\]/g, ".");
    const host = new URL(cleaned.startsWith("http") ? cleaned : `https://${cleaned}`).hostname;
    return host.length > 32 ? host.slice(0, 29) + "…" : host;
  } catch {
    return url.length > 32 ? url.slice(0, 29) + "…" : url;
  }
}

/* ── KPI Card ────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  icon,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${accent}`}>{value}</p>
          {sub && <p className="mt-0.5 text-[11px] text-gray-600">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent} bg-white/5`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ── Icons (inline SVGs) ─────────────────────────────────────── */

const icons = {
  shield: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  alert: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  fire: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  trophy: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
    </svg>
  ),
  bolt: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  lock: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  camera: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  ),
  play: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  ),
};

/* ── Quick Action Button ─────────────────────────────────────── */

function QuickAction({
  href,
  icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5 transition-all hover:border-white/10 hover:bg-white/[0.04]`}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent} bg-white/5 transition-transform group-hover:scale-110`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </Link>
  );
}

/* ── Progress Bar ────────────────────────────────────────────── */

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */

export default function DashboardPage() {
  const { language } = useLanguage();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/summary");
      if (res.status === 401) {
        setError(t("dashboard.loginRequired", language));
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load dashboard");
        return;
      }
      setData(json as DashboardSummary);
    } catch {
      setError("Unable to reach the server. Try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Loading ────────────────────────────────────────────── */

  if (loading) {
    return (
      <>
        <PageHeader title={t("nav.dashboard", language)} subtitle={t("dashboard.loading", language)} />
        <LoadingSpinner />
      </>
    );
  }

  /* ── Error ──────────────────────────────────────────────── */

  if (error || !data) {
    return (
      <>
        <PageHeader title={t("nav.dashboard", language)} />
        <div className="mx-auto max-w-md">
          <Toast type="error" message={error || "Unknown error"} onDismiss={() => setError("")} />
          <button
            onClick={fetchData}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            {t("action.retry", language)}
          </button>
        </div>
      </>
    );
  }

  /* ── Data aliases ───────────────────────────────────────── */

  const { phishing, quiz } = data;
  const lastPct = quiz.lastSession?.percent ?? 0;

  return (
    <>
      <PageHeader
        title={`${t("dashboard.welcome", language)}${data.user.name ? `, ${data.user.name}` : ""}`}
        subtitle={t("dashboard.subtitle", language)}
      />

      {/* ── KPI Grid ──────────────────────────────────────── */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("dashboard.analyzed", language)}
          value={phishing.analyzedCount}
          icon={icons.shield}
          accent="text-cyan-400"
          sub={`${phishing.reportedCount} ${t("dashboard.reported", language)}`}
        />
        <KpiCard
          label={t("dashboard.highRisk", language)}
          value={phishing.highRiskCount}
          icon={icons.alert}
          accent="text-red-400"
          sub={phishing.analyzedCount > 0 ? `${Math.round((phishing.highRiskCount / phishing.analyzedCount) * 100)}% ${t("dashboard.ofTotal", language)}` : undefined}
        />
        <KpiCard
          label={t("streak.daily", language)}
          value={quiz.dailyStreak.current}
          icon={icons.fire}
          accent="text-orange-400"
          sub={`${t("dashboard.best", language)}: ${quiz.dailyStreak.best}`}
        />
        <KpiCard
          label={t("dashboard.lastScore", language)}
          value={quiz.lastSession ? `${lastPct}%` : "—"}
          icon={icons.trophy}
          accent="text-purple-400"
          sub={quiz.lastSession ? `${quiz.lastSession.correct}/${quiz.lastSession.total} ${t("quiz.gotCorrect", language)}` : t("quiz.noQuizzes", language)}
        />
      </div>

      {/* ── Middle Row: Reports + Streaks ─────────────────── */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Reports ─ 2/3 */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{t("dashboard.recentReports", language)}</h3>
              <Link href="/reports" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                {t("dashboard.viewAll", language)}
              </Link>
            </div>

            {phishing.lastReports.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-600">
                {t("dashboard.noReports", language)}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] font-medium uppercase tracking-wider text-gray-600">
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Domain</th>
                      <th className="pb-2 pr-4">Risk</th>
                      <th className="pb-2 pr-4 text-right">Score</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {phishing.lastReports.map((r) => (
                      <tr key={r.id} className="border-b border-white/[0.03] last:border-0">
                        <td className="py-2.5 pr-4 text-xs text-gray-500 whitespace-nowrap">{timeAgo(r.createdAt)}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-gray-300 whitespace-nowrap">{domainFromUrl(r.normalizedUrl)}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${riskColor[r.overallRisk]}`}>
                            {r.overallRisk}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono text-xs text-gray-400">{r.riskScore}</td>
                        <td className="py-2.5 text-right">
                          <Link
                            href={`/reports`}
                            className="text-[11px] text-cyan-500 hover:text-cyan-400 transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Streak Panel ─ 1/3 */}
        <div className="space-y-4">
          {/* Daily Streak */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">{t("streak.daily", language)}</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-orange-400">{quiz.dailyStreak.current}</span>
              <span className="mb-1 text-xs text-gray-600">/ {quiz.dailyStreak.best} {t("dashboard.best", language).toLowerCase()}</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={quiz.dailyStreak.current}
                max={Math.max(quiz.dailyStreak.best, 7)}
                color="bg-gradient-to-r from-orange-500 to-amber-400"
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-600">
              {quiz.dailyStreak.current > 0 ? t("dashboard.keepItUp", language) : t("dashboard.startStreak", language)}
            </p>
          </Card>

          {/* Answer Streak */}
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-white">{t("streak.answer", language)}</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-purple-400">{quiz.answerStreak.current}</span>
              <span className="mb-1 text-xs text-gray-600">/ {quiz.answerStreak.best} {t("dashboard.best", language).toLowerCase()}</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={quiz.answerStreak.current}
                max={Math.max(quiz.answerStreak.best, 10)}
                color="bg-gradient-to-r from-purple-500 to-fuchsia-400"
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-600">
              {t("dashboard.consecutiveCorrect", language)}
            </p>
          </Card>

          {/* Vault */}
          <Card>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${data.vault.isUnlocked ? "text-emerald-400" : "text-gray-500"} bg-white/5`}>
                {icons.lock}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t("vault.title", language)}</h3>
                <p className="text-xs text-gray-500">
                  {data.vault.isUnlocked ? t("vault.setup", language) : t("vault.notSetup", language)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────── */}

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-white">{t("dashboard.quickActions", language)}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction href="/phishing" icon={icons.shield} label={t("action.analyze", language)} accent="text-cyan-400" />
          <QuickAction href="/phishing?mode=image" icon={icons.camera} label={t("dashboard.screenshot", language)} accent="text-blue-400" />
          <QuickAction href="/quiz" icon={icons.play} label={t("action.startQuiz", language)} accent="text-emerald-400" />
          <QuickAction href="/vault" icon={icons.lock} label={t("action.openVault", language)} accent="text-amber-400" />
        </div>
      </div>

      {/* ── Heatmap ───────────────────────────────────────── */}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{t("dashboard.heatmapTitle", language)}</h3>
          <Link href="/heatmap" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            {t("dashboard.fullView", language)}
          </Link>
        </div>
        <TunisiaHeatMap />
      </div>

      {/* ── Quiz Summary ──────────────────────────────────── */}

      {quiz.totalSessions > 0 && (
        <div className="mt-6">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{t("dashboard.quizHistory", language)}</h3>
                <p className="text-xs text-gray-500">
                  {quiz.totalSessions} {t("dashboard.sessionsCompleted", language)}
                </p>
              </div>
              {quiz.lastSession && (
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Last score:{" "}
                    <span className={`font-semibold ${quiz.lastSession.percent >= 80 ? "text-emerald-400" : quiz.lastSession.percent >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {quiz.lastSession.percent}%
                    </span>
                  </span>
                  <span>{timeAgo(quiz.lastSession.completedAt)}</span>
                </div>
              )}
              <Link
                href="/quiz"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:brightness-110"
              >
                {icons.play}
                {t("quiz.playAgain", language)}
              </Link>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
