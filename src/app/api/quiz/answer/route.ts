import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AnswerRequestSchema } from "@/lib/quiz/schemas";
import type { AnswerResponse } from "@/lib/quiz/schemas";
import {
  getUserStreaks,
  updateUserStreaks,
  getQuizSession,
  getQuestionInstance,
  answerQuestionInstance,
} from "@/lib/quiz/db";
import { updateAnswerStreak } from "@/lib/quiz/streak";

/**
 * POST /api/quiz/answer
 * Auth required.
 * Body: { sessionId, questionInstanceId, selectedIndex }
 *
 * Checks the answer, updates the question instance, and tracks
 * the in-session answer streak (consecutive correct answers).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = AnswerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, questionInstanceId, selectedIndex } = parsed.data;

    // 1. Verify session belongs to user
    const session = await getQuizSession(sessionId);
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.completed_at) {
      return NextResponse.json({ error: "Session already completed" }, { status: 400 });
    }

    // 2. Load question instance
    const instance = await getQuestionInstance(sessionId, questionInstanceId);
    if (!instance) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (instance.answered_index !== null) {
      return NextResponse.json({ error: "Question already answered" }, { status: 400 });
    }

    // 3. Check answer
    const isCorrect = selectedIndex === instance.correct_index;

    // 4. Update instance
    await answerQuestionInstance(questionInstanceId, selectedIndex, isCorrect);

    // 5. Update answer streak
    const streaks = await getUserStreaks(user.id);
    const newAnswerStreak = updateAnswerStreak(
      isCorrect,
      streaks.current_answer_streak,
      streaks.best_answer_streak
    );

    await updateUserStreaks(user.id, {
      current_answer_streak: newAnswerStreak.current,
      best_answer_streak: newAnswerStreak.best,
    });

    // 6. Return result
    const response: AnswerResponse = {
      success: true,
      isCorrect,
      correctIndex: instance.correct_index,
      explanation: instance.explanation,
      tip: instance.tip,
      streaks: {
        answer: newAnswerStreak,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[quiz/answer]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
