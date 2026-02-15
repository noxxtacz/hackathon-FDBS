import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { maskEmail } from "@/lib/helpers";
import type { LeaderboardEntry } from "@/lib/types";

/**
 * GET /api/leaderboard
 * Public — returns top 10 users by streak with report counts.
 */
export async function GET() {
  try {
    // 1. Fetch top 10 streaks ordered by current then longest
    const { data: streaks, error: streakErr } = await supabaseAdmin
      .from("user_streaks")
      .select("user_id, current_streak, longest_streak")
      .order("current_streak", { ascending: false })
      .order("longest_streak", { ascending: false })
      .limit(10);

    if (streakErr) {
      console.error("[leaderboard] streak query:", streakErr);
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    if (!streaks || streaks.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // 2. Collect user IDs for batch lookups
    const userIds = streaks.map((s) => s.user_id as string);

    // 3. Fetch emails from auth.users via admin API
    const emailMap = new Map<string, string>();
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 100,
    });

    if (!authErr && authUsers?.users) {
      for (const u of authUsers.users) {
        if (userIds.includes(u.id) && u.email) {
          emailMap.set(u.id, u.email);
        }
      }
    }

    // 4. Count reports per user in a single query
    const { data: reportRows, error: reportErr } = await supabaseAdmin
      .from("threat_reports")
      .select("created_by")
      .in("created_by", userIds);

    const reportCounts = new Map<string, number>();
    if (!reportErr && reportRows) {
      for (const row of reportRows) {
        const uid = row.created_by as string;
        reportCounts.set(uid, (reportCounts.get(uid) ?? 0) + 1);
      }
    }

    // 5. Assemble leaderboard
    const leaderboard: LeaderboardEntry[] = streaks.map((s, index) => ({
      rank: index + 1,
      masked_email: maskEmail(emailMap.get(s.user_id as string) ?? "unknown@user"),
      current_streak: s.current_streak as number,
      longest_streak: s.longest_streak as number,
      total_reports: reportCounts.get(s.user_id as string) ?? 0,
    }));

    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("[leaderboard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
