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

/* ── Dashboard summary ── */
export interface DashboardLastReport {
  id: string;
  createdAt: string;
  normalizedUrl: string | null;
  overallRisk: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
}

export interface DashboardSummary {
  success: true;
  user: { name?: string };
  vault: { isUnlocked: boolean };
  phishing: {
    analyzedCount: number;
    reportedCount: number;
    highRiskCount: number;
    lastReports: DashboardLastReport[];
  };
  quiz: {
    dailyStreak: { current: number; best: number };
    answerStreak: { current: number; best: number };
    totalSessions: number;
    lastSession: { percent: number; correct: number; total: number; completedAt: string } | null;
  };
}

/** @deprecated — kept for backward compat */
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
