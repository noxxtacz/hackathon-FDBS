import type { ThreatReport } from "@/lib/types";
import Card from "./Card";
import RiskBadge from "./RiskBadge";

interface Props {
  report: ThreatReport;
  onVote?: (reportId: string) => void;
}

export default function ReportCard({ report, onVote }: Props) {
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

      {report.url_defanged && (
        <p className="mt-3 break-all rounded-lg bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-gray-500">
          {report.url_defanged}
        </p>
      )}

      {report.description && (
        <p className="mt-3 text-sm leading-relaxed text-gray-400">{report.description}</p>
      )}

      {/* Risk reasons */}
      {report.risk_reasons && report.risk_reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {report.risk_reasons.slice(0, 5).map((reason, i) => (
            <span
              key={i}
              className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-gray-500"
            >
              {reason}
            </span>
          ))}
        </div>
      )}

      {report.solution && (
        <div className="mt-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-2.5 text-sm text-cyan-300">
          <span className="font-semibold">Solution:</span> {report.solution}
        </div>
      )}

      {/* Footer: date + votes */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          {new Date(report.created_at).toLocaleDateString()}
        </p>

        <button
          onClick={() => onVote?.(report.id)}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
            report.user_voted
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "border border-white/10 bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
          }`}
        >
          <svg
            className="h-3.5 w-3.5"
            fill={report.user_voted ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
          {report.vote_count ?? 0}
        </button>
      </div>
    </Card>
  );
}
