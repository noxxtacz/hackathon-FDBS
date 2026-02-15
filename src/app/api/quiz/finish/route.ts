import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { FinishRequestSchema } from "@/lib/quiz/schemas";
import type { FinishResponse, StreakSummary } from "@/lib/quiz/schemas";
import {
  getUserStreaks,
  updateUserStreaks,
  getQuizSession,
  finishQuizSession,
} from "@/lib/quiz/db";
import { computeDailyStreakUpdate } from "@/lib/quiz/streak";

/**
 * POST /api/quiz/finish
 * Auth required.
 * Body: { sessionId }
 *
 * Marks the session as completed, computes the score,
 * and updates the daily streak.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = FinishRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sessionId } = parsed.data;

    // 1. Verify session belongs to user
    const session = await getQuizSession(sessionId);
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.completed_at) {
      return NextResponse.json({ error: "Session already completed" }, { status: 400 });
    }

    // 2. Mark session completed and compute score
    const finished = await finishQuizSession(sessionId);
    const total = finished.total_questions;
    const correct = finished.correct_count;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    // 3. Update daily streak
    const today = new Date().toISOString().slice(0, 10);
    const streaks = await getUserStreaks(user.id);

    const dailyUpdate = computeDailyStreakUpdate(
      streaks.last_activity_date,
      today,
      streaks.current_streak,
      streaks.longest_streak
    );

    const updated = await updateUserStreaks(user.id, {
      current_streak: dailyUpdate.current,
      longest_streak: dailyUpdate.best,
      last_activity_date: dailyUpdate.lastQuizDate,
    });

    // 4. Build response
    const streakSummary: StreakSummary = {
      daily: {
        current: updated.current_streak,
        best: updated.longest_streak,
        lastQuizDate: updated.last_activity_date,
      },
      answer: {
        current: updated.current_answer_streak,
        best: updated.best_answer_streak,
      },
    };

    const response: FinishResponse = {
      success: true,
      summary: { total, correct, percent },
      streaks: streakSummary,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[quiz/finish]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
