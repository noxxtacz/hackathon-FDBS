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
  created_at: string;
  created_by: string | null;
  threat_type: string;
  governorate: string;
  url_defanged: string | null;
  description: string | null;
  solution: string | null;
  risk_score: number;
  risk_label: RiskLabel;
  risk_reasons: string[];
  image_path: string | null;
  status: "pending" | "approved" | "rejected";
  vote_count?: number;
  user_voted?: boolean;
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
