import type { ThreatReport } from "@/lib/types";
import Card from "./Card";
import RiskBadge from "./RiskBadge";

interface Props {
  report: ThreatReport;
}

export default function ReportCard({ report }: Props) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{report.threat_type}</h3>
          <p className="mt-0.5 text-sm text-gray-500">{report.governorate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Score: {report.risk_score}
          </span>
          <RiskBadge label={report.risk_label} />
        </div>
      </div>

      <p className="mt-3 break-all font-mono text-xs text-gray-400">
        {report.defanged_url}
      </p>

      <p className="mt-3 text-sm text-gray-700">{report.description}</p>

      {report.solution && (
        <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <strong>Solution:</strong> {report.solution}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        {new Date(report.created_at).toLocaleDateString()}
      </p>
    </Card>
  );
}
