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

const maxCount = Math.max(...SAMPLE_DATA.map((d) => d.count));

export default function HeatmapPage() {
  return (
    <>
      <PageHeader
        title="Threat Heatmap"
        subtitle="Reports by governorate. Map visualization coming soon."
      />

      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="pb-2 font-medium">Governorate</th>
              <th className="pb-2 font-medium">Reports</th>
              <th className="pb-2 font-medium">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_DATA.sort((a, b) => b.count - a.count).map((row) => (
              <tr key={row.governorate} className="border-b border-gray-100 last:border-0">
                <td className="py-2 font-medium text-gray-900">
                  {row.governorate}
                </td>
                <td className="py-2 text-gray-600">{row.count}</td>
                <td className="py-2">
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{
                        width: `${(row.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 text-center text-xs text-gray-400">
        Interactive Leaflet map will replace this table in a future release.
      </p>
    </>
  );
}
