/* ── Risk labels ── */
export type RiskLabel = "safe" | "suspicious" | "dangerous";

/* ── POST /api/analyze/url response ── */
export interface AnalyzeResponse {
  url: string;
  defanged_url: string;
  score: number;
  label: RiskLabel;
  reasons: string[];
  advice: string;
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
  id: number | string;
  question: string;
  options: string[];
  correctIndex: number;
}

/* ── User streak ── */
export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
}

/* ── Dashboard response ── */
export interface DashboardResponse {
  streak: {
    current: number;
    longest: number;
  };
  reports: {
    total: number;
    recent: ThreatReport[];
  };
  quiz: {
    totalAttempts: number;
    averageScore: number;
  };
}

/* ── Leaderboard entry ── */
export interface LeaderboardEntry {
  rank: number;
  masked_email: string;
  current_streak: number;
  longest_streak: number;
  total_reports: number;
}
