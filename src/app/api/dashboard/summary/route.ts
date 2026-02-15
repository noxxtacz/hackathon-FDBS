import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { DashboardSummary, DashboardLastReport, RiskLabel } from "@/lib/types";

/* ── helpers ─────────────────────────────────────────────────── */

function riskToDisplay(label: RiskLabel | string, score: number): DashboardLastReport["overallRisk"] {
  if (label === "dangerous" || score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (label === "suspicious" || score >= 30) return "Medium";
  return "Low";
}

/* ── GET /api/dashboard/summary ──────────────────────────────── */

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Run all independent queries in parallel
    const [
      reportsCountRes,
      highRiskCountRes,
      recentReportsRes,
      streakRes,
      quizSessionsCountRes,
      lastSessionRes,
    ] = await Promise.all([
      // 1. Total analyzed reports by user
      supabaseAdmin
        .from("threat_reports")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id),

      // 2. High-risk reports (score >= 60)
      supabaseAdmin
        .from("threat_reports")
        .select("*", { count: "exact", head: true })
        .eq("created_by", user.id)
        .gte("risk_score", 60),

      // 3. Last 5 reports
      supabaseAdmin
        .from("threat_reports")
        .select("id, created_at, url_defanged, risk_score, risk_label")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false })
        .limit(5),

      // 4. User streaks row (including answer streak columns)
      supabaseAdmin
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),

      // 5. Total quiz sessions
      supabaseAdmin
        .from("quiz_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),

      // 6. Last completed quiz session
      supabaseAdmin
        .from("quiz_sessions")
        .select("completed_at, total_questions, correct_count")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // Map recent reports
    const lastReports: DashboardLastReport[] = (recentReportsRes.data ?? []).map(
      (r: { id: string; created_at: string; url_defanged: string | null; risk_score: number; risk_label: string }) => ({
        id: r.id,
        createdAt: r.created_at,
        normalizedUrl: r.url_defanged,
        overallRisk: riskToDisplay(r.risk_label, r.risk_score),
        riskScore: r.risk_score,
      }),
    );

    // Build last session
    const ls = lastSessionRes.data;
    const lastSession = ls
      ? {
          percent: ls.total_questions > 0 ? Math.round((ls.correct_count / ls.total_questions) * 100) : 0,
          correct: ls.correct_count,
          total: ls.total_questions,
          completedAt: ls.completed_at,
        }
      : null;

    // Streak data
    const stk = streakRes.data;

    const reportedCount = reportsCountRes.count ?? 0;

    // Vault status: check if a vault_master row exists for this user
    const { data: vaultRow } = await supabaseAdmin
      .from("vault_master")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const response: DashboardSummary = {
      success: true,
      user: { name: user.user_metadata?.full_name ?? user.email?.split("@")[0] },
      vault: { isUnlocked: !!vaultRow },
      phishing: {
        analyzedCount: reportedCount,
        reportedCount,
        highRiskCount: highRiskCountRes.count ?? 0,
        lastReports,
      },
      quiz: {
        dailyStreak: {
          current: stk?.current_streak ?? 0,
          best: stk?.longest_streak ?? 0,
        },
        answerStreak: {
          current: stk?.current_answer_streak ?? 0,
          best: stk?.best_answer_streak ?? 0,
        },
        totalSessions: quizSessionsCountRes.count ?? 0,
        lastSession,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[dashboard/summary]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
