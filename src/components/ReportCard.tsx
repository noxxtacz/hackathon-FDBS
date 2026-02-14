import type { ThreatReport } from "@/lib/types";
import Card from "./Card";
import RiskBadge from "./RiskBadge";

interface Props {
  report: ThreatReport;
}

export default function ReportCard({ report }: Props) {
  return (
    <Card hover>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">{report.threat_type}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{report.governorate}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="rounded-lg bg-white/5 px-2 py-0.5 text-sm font-mono font-medium text-gray-300">
            {report.risk_score}
          </span>
          <RiskBadge label={report.risk_label} />
        </div>
      </div>

      <p className="mt-3 break-all rounded-lg bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-gray-500">
        {report.defanged_url}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-gray-400">{report.description}</p>

      {report.solution && (
        <div className="mt-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-2.5 text-sm text-cyan-300">
          <span className="font-semibold">Solution:</span> {report.solution}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-600">
        {new Date(report.created_at).toLocaleDateString()}
      </p>
    </Card>
  );
}
