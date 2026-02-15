"use client";

import { useEffect, useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

interface LeaderboardEntry {
  rank: number;
  masked_email: string;
  current_streak: number;
  longest_streak: number;
  total_reports: number;
}

const medal = ["", "🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load scoreboard");
        return;
      }
      setEntries(json.leaderboard ?? []);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <>
        <PageHeader title="Scoreboard" subtitle="Loading rankings…" />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Scoreboard" />
        <div className="mx-auto max-w-md">
          <Toast type="error" message={error} onDismiss={() => setError("")} />
          <button
            onClick={fetchData}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Scoreboard"
        subtitle="Top cyber-aware users ranked by streak and contributions."
      />

      <div className="mx-auto max-w-2xl">
        {entries.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-gray-500">No entries yet. Start a streak to claim the top spot!</p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-medium uppercase tracking-wider text-gray-600">
                    <th className="pb-2 pr-3 w-12">#</th>
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4 text-center">Streak</th>
                    <th className="pb-2 pr-4 text-center">Best</th>
                    <th className="pb-2 text-center">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const isTop3 = e.rank <= 3;
                    return (
                      <tr
                        key={e.rank}
                        className={`border-b border-white/[0.03] last:border-0 ${isTop3 ? "bg-white/[0.02]" : ""}`}
                      >
                        <td className="py-3 pr-3 text-center">
                          {isTop3 ? (
                            <span className="text-lg">{medal[e.rank]}</span>
                          ) : (
                            <span className="text-xs text-gray-600">{e.rank}</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`font-medium ${isTop3 ? "text-white" : "text-gray-400"}`}>
                            {e.masked_email}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className="inline-flex items-center gap-1 text-orange-400">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                            </svg>
                            {e.current_streak}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center text-xs text-gray-500">{e.longest_streak}</td>
                        <td className="py-3 text-center">
                          <span className="inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                            {e.total_reports}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
