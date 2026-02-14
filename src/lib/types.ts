/* ── Risk labels ── */
export type RiskLabel = "safe" | "suspicious" | "dangerous";

/* ── POST /api/analyze/url response ── */
export interface AnalyzeResponse {
  url: string;
  defanged_url: string;
  score: number;
  label: RiskLabel;
  reasons: string[];
  advice: string[];
}

/* ── Threat report ── */
export interface ThreatReport {
  id: string;
  threat_type: string;
  governorate: string;
  description: string;
  solution: string;
  defanged_url: string;
  risk_score: number;
  risk_label: RiskLabel;
  reasons: string[];
  created_at: string;
}

/* ── Heatmap row ── */
export interface HeatmapRow {
  governorate: string;
  count: number;
}

/* ── Quiz ── */
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}
