"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

/* ── Lazy-load the Leaflet map (no SSR) ─────────────────────── */

const TunisiaHeatMap = dynamic(() => import("@/components/TunisiaHeatMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
      <LoadingSpinner />
    </div>
  ),
});

/* ── Types ──────────────────────────────────────────────────── */

interface HeatmapRow {
  governorate: string;
  count: number;
}

function heatColor(pct: number) {
  if (pct > 70) return "from-red-500 to-red-400";
  if (pct > 40) return "from-orange-500 to-yellow-400";
  return "from-cyan-500 to-blue-400";
}

/* ── Page ────────────────────────────────────────────────────── */

export default function HeatmapPage() {
  const { language } = useLanguage();
  const [rows, setRows] = useState<HeatmapRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/heatmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.heatmap) setRows(d.heatmap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalReports = rows.reduce((s, r) => s + r.count, 0);
  const topRegion = rows.length > 0 ? rows[0].governorate : "—";
  const maxCount = rows.length > 0 ? rows[0].count : 1;

  return (
    <>
      <PageHeader
        title={t("heatmap.title", language)}
        subtitle={t("heatmap.subtitle", language)}
      />

      {/* Summary stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Reports",
            value: loading ? "…" : totalReports,
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            label: "Governorates",
            value: rows.length,
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
          {
            label: "Top Region",
            value: topRegion,
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Map */}
      <section className="mb-6">
        <TunisiaHeatMap />
      </section>

      {/* Data Table */}
      {rows.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-white">Reports by Governorate</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-500">
                  <th className="pb-3 font-medium">Governorate</th>
                  <th className="pb-3 font-medium text-right">Reports</th>
                  <th className="pb-3 font-medium pl-6">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const pct = (row.count / maxCount) * 100;
                  return (
                    <tr key={row.governorate} className="border-b border-white/[0.03] last:border-0 transition-colors hover:bg-white/[0.02]">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-xs font-medium text-gray-500">
                            {i + 1}
                          </span>
                          <span className="font-medium text-gray-200">{row.governorate}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-gray-400">{row.count}</td>
                      <td className="py-3 pl-6">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${heatColor(pct)} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
