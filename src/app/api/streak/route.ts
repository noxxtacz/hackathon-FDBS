import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getStreak } from "@/lib/streak";

/**
 * GET /api/streak
 * Auth required — returns the user's current streak data.
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

    const streak = await getStreak(user.id);

    return NextResponse.json({
      current: streak?.current_streak ?? 0,
      longest: streak?.longest_streak ?? 0,
      last_activity_date: streak?.last_activity_date ?? null,
    });
  } catch (err) {
    console.error("[streak GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
