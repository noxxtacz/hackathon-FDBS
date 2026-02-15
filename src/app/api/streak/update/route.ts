import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { updateStreak } from "@/lib/streak";

/**
 * POST /api/streak/update
 * Auth required — bumps the user's daily streak.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const streak = await updateStreak(user.id);

    return NextResponse.json({
      current: streak.current_streak,
      longest: streak.longest_streak,
      last_activity_date: streak.last_activity_date,
    });
  } catch (err) {
    console.error("[streak/update]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
