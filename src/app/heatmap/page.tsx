import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import type { HeatmapRow } from "@/lib/types";

const SAMPLE_DATA: HeatmapRow[] = [
  { governorate: "Muscat", count: 42 },
  { governorate: "Dhofar", count: 18 },
  { governorate: "Al Dakhiliyah", count: 14 },
  { governorate: "Al Batinah North", count: 22 },
  { governorate: "Al Batinah South", count: 9 },
  { governorate: "Al Sharqiyah North", count: 7 },
  { governorate: "Al Sharqiyah South", count: 5 },
  { governorate: "Al Dhahirah", count: 3 },
  { governorate: "Al Buraimi", count: 2 },
  { governorate: "Al Wusta", count: 1 },
  { governorate: "Musandam", count: 4 },
];

const sorted = [...SAMPLE_DATA].sort((a, b) => b.count - a.count);
const maxCount = sorted[0].count;
const totalReports = sorted.reduce((s, r) => s + r.count, 0);
const topRegion = sorted[0].governorate;

function heatColor(pct: number) {
  if (pct > 70) return "from-red-500 to-red-400";
  if (pct > 40) return "from-orange-500 to-yellow-400";
  return "from-cyan-500 to-blue-400";
}

export default function HeatmapPage() {
  return (
    <>
      <PageHeader
        title="Threat Heatmap"
        subtitle="Reports by governorate. Map visualization coming soon."
      />

      {/* Summary stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Reports", value: totalReports, icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          )},
          { label: "Governorates", value: SAMPLE_DATA.length, icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          )},
          { label: "Top Region", value: topRegion, icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          )},
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

      {/* Table */}
      <Card>
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
              {sorted.map((row, i) => {
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

      <p className="mt-6 text-center text-xs text-gray-600">
        Interactive Leaflet map will replace this table in a future release.
      </p>
    </>
  );
}
