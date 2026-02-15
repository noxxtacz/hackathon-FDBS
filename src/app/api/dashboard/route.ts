import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStreak } from "@/lib/streak";
import type { DashboardResponse } from "@/lib/types";

/**
 * GET /api/dashboard
 * Auth required — returns aggregated dashboard data.
 */
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

    // Run all queries in parallel for performance
    const [streakResult, reportsCountResult, recentReportsResult, quizCountResult, quizAvgResult] =
      await Promise.all([
        // 1. Streak
        getStreak(user.id),

        // 2. Total reports by this user
        supabaseAdmin
          .from("threat_reports")
          .select("*", { count: "exact", head: true })
          .eq("created_by", user.id),

        // 3. Last 5 reports
        supabaseAdmin
          .from("threat_reports")
          .select("*")
          .eq("created_by", user.id)
          .order("created_at", { ascending: false })
          .limit(5),

        // 4. Total quiz attempts
        supabaseAdmin
          .from("quiz_runs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),

        // 5. Average quiz score (raw query via rpc or JS fallback)
        supabaseAdmin
          .from("quiz_runs")
          .select("score")
          .eq("user_id", user.id),
      ]);

    // Calculate average score in JS (Supabase JS client doesn't support avg directly)
    const scores = quizAvgResult.data ?? [];
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, r) => sum + (r.score as number), 0) / scores.length)
        : 0;

    const response: DashboardResponse = {
      streak: {
        current: streakResult?.current_streak ?? 0,
        longest: streakResult?.longest_streak ?? 0,
      },
      reports: {
        total: reportsCountResult.count ?? 0,
        recent: (recentReportsResult.data ?? []) as DashboardResponse["reports"]["recent"],
      },
      quiz: {
        totalAttempts: quizCountResult.count ?? 0,
        averageScore,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
