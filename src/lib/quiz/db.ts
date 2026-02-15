/* ------------------------------------------------------------------
   Quiz Game — Database helpers (Supabase)
   ------------------------------------------------------------------
   Wraps all DB operations needed by the quiz API routes.
   Uses supabaseAdmin (service-role) for writes and
   createSupabaseServer for auth-scoped reads where appropriate.
   ------------------------------------------------------------------ */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  QuizQuestion,
  Topic,
  Difficulty,
} from "./schemas";
import type { ReportSummary } from "./groq";

/* ── Types matching DB rows ────────────────────────────────── */

export interface UserStreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
  current_answer_streak: number;
  best_answer_streak: number;
}

export interface QuizSessionRow {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_count: number;
}

export interface QuestionInstanceRow {
  id: string;
  session_id: string;
  source: "report_generated" | "general_db";
  report_id: string | null;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  tip: string;
  answered_index: number | null;
  is_correct: boolean | null;
  sort_order: number;
}

/* ── User streaks ──────────────────────────────────────────── */

export async function getUserStreaks(userId: string): Promise<UserStreakRow> {
  const { data, error } = await supabaseAdmin
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  // Auto-create row if missing
  if (!data) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("user_streaks")
      .insert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        current_answer_streak: 0,
        best_answer_streak: 0,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (createErr) throw createErr;
    return created as UserStreakRow;
  }

  return data as UserStreakRow;
}

export async function updateUserStreaks(
  userId: string,
  patch: Partial<Omit<UserStreakRow, "user_id">>
): Promise<UserStreakRow> {
  const { data, error } = await supabaseAdmin
    .from("user_streaks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserStreakRow;
}

/* ── Reports for question generation ──────────────────────── */

export async function getRecentReports(
  limit = 10
): Promise<ReportSummary[]> {
  const { data, error } = await supabaseAdmin
    .from("threat_reports")
    .select("id, url_defanged, description, risk_score, risk_label, risk_reasons, threat_type")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[quiz/db] Failed to fetch reports:", error);
    return [];
  }

  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    urlSnippet: (r.url_defanged as string) ?? null,
    textSnippet: ((r.description as string) ?? "").slice(0, 500),
    riskScore: (r.risk_score as number) ?? 0,
    overallRisk:
      (r.risk_score as number) >= 70
        ? "High"
        : (r.risk_score as number) >= 30
          ? "Medium"
          : "Low",
    redFlags: Array.isArray(r.risk_reasons) ? (r.risk_reasons as string[]) : [],
    threatType: (r.threat_type as string) ?? "Unknown",
  }));
}

/* ── General questions ─────────────────────────────────────── */

export async function getGeneralQuestions(params: {
  topic?: Topic;
  difficulty?: Difficulty;
  limit: number;
}): Promise<QuizQuestion[]> {
  let query = supabaseAdmin
    .from("general_questions")
    .select("*")
    .limit(params.limit * 3); // over-fetch to allow shuffle

  if (params.topic) {
    query = query.eq("topic", params.topic);
  }
  if (params.difficulty) {
    query = query.eq("difficulty", params.difficulty);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[quiz/db] Failed to fetch general questions:", error);
    return [];
  }

  // Shuffle and take the requested number
  const shuffled = (data ?? []).sort(() => Math.random() - 0.5).slice(0, params.limit);

  return shuffled.map((q: Record<string, unknown>) => ({
    question: q.question as string,
    options: q.options as [string, string, string, string],
    correctIndex: q.correct_index as number,
    explanation: (q.explanation as string) ?? "",
    tip: (q.tip as string) ?? "",
    source: "general_db" as const,
    reportId: null,
    topic: (q.topic as Topic) ?? "general",
    difficulty: (q.difficulty as Difficulty) ?? "medium",
  }));
}

/* ── Quiz sessions ─────────────────────────────────────────── */

export async function createQuizSession(
  userId: string,
  totalQuestions: number
): Promise<QuizSessionRow> {
  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .insert({
      user_id: userId,
      total_questions: totalQuestions,
      correct_count: 0,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as QuizSessionRow;
}

export async function getQuizSession(
  sessionId: string
): Promise<QuizSessionRow | null> {
  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data as QuizSessionRow | null;
}

export async function finishQuizSession(
  sessionId: string
): Promise<QuizSessionRow> {
  // Count correct answers
  const { count } = await supabaseAdmin
    .from("quiz_question_instances")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("is_correct", true);

  const { data, error } = await supabaseAdmin
    .from("quiz_sessions")
    .update({
      completed_at: new Date().toISOString(),
      correct_count: count ?? 0,
    })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) throw error;
  return data as QuizSessionRow;
}

/* ── Quiz question instances ───────────────────────────────── */

export async function createQuestionInstances(
  sessionId: string,
  questions: QuizQuestion[]
): Promise<QuestionInstanceRow[]> {
  const rows = questions.map((q, i) => ({
    session_id: sessionId,
    source: q.source,
    report_id: q.reportId ?? null,
    question: q.question,
    options: q.options,
    correct_index: q.correctIndex,
    explanation: q.explanation,
    tip: q.tip,
    sort_order: i,
  }));

  const { data, error } = await supabaseAdmin
    .from("quiz_question_instances")
    .insert(rows)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as QuestionInstanceRow[];
}

export async function getQuestionInstance(
  sessionId: string,
  questionInstanceId: string
): Promise<QuestionInstanceRow | null> {
  const { data, error } = await supabaseAdmin
    .from("quiz_question_instances")
    .select("*")
    .eq("id", questionInstanceId)
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data as QuestionInstanceRow | null;
}

export async function answerQuestionInstance(
  questionInstanceId: string,
  selectedIndex: number,
  isCorrect: boolean
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("quiz_question_instances")
    .update({
      answered_index: selectedIndex,
      is_correct: isCorrect,
    })
    .eq("id", questionInstanceId);

  if (error) throw error;
}
