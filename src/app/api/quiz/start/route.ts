import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { StartQuizRequestSchema } from "@/lib/quiz/schemas";
import type { ClientQuestion, StartQuizResponse, StreakSummary } from "@/lib/quiz/schemas";
import {
  getUserStreaks,
  getRecentReports,
  getGeneralQuestions,
  createQuizSession,
  createQuestionInstances,
} from "@/lib/quiz/db";
import { generateQuestionsFromReports } from "@/lib/quiz/groq";

/**
 * POST /api/quiz/start
 * Auth required.
 * Body: { count: 1-10, topic?, difficulty? }
 *
 * Flow:
 *  1. Load recent threat reports
 *  2. Generate report-based questions via Groq (60% if reports exist)
 *  3. Fill remaining with general DB questions
 *  4. Create session + instances in DB
 *  5. Return questions WITHOUT correctIndex
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = StartQuizRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { count, topic, difficulty } = parsed.data;

    // 1. Load recent reports for Groq-based question generation
    const reports = await getRecentReports(10);

    // 2. Split: 60% report-based / 40% general if reports exist
    const reportCount = reports.length > 0 ? Math.ceil(count * 0.6) : 0;

    // 3. Generate report-based questions via Groq
    const reportQuestions = reportCount > 0
      ? await generateQuestionsFromReports({
          reports,
          count: reportCount,
          topic,
          difficulty,
        })
      : [];

    // 4. Fetch general questions from DB to fill remaining
    const actualGeneralNeeded = count - reportQuestions.length;
    const generalQuestions = actualGeneralNeeded > 0
      ? await getGeneralQuestions({
          topic,
          difficulty,
          limit: actualGeneralNeeded,
        })
      : [];

    // 5. Combine and shuffle
    const allQuestions = [...reportQuestions, ...generalQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions available. Please try a different topic." },
        { status: 404 }
      );
    }

    // 6. Create quiz session + question instances in DB
    const session = await createQuizSession(user.id, allQuestions.length);
    const instances = await createQuestionInstances(session.id, allQuestions);

    // 7. Build streak summary
    const streaks = await getUserStreaks(user.id);
    const streakSummary: StreakSummary = {
      daily: {
        current: streaks.current_streak,
        best: streaks.longest_streak,
        lastQuizDate: streaks.last_activity_date,
      },
      answer: {
        current: streaks.current_answer_streak,
        best: streaks.best_answer_streak,
      },
    };

    // 8. Return questions WITHOUT correctIndex
    const clientQuestions: ClientQuestion[] = instances.map((inst) => ({
      id: inst.id,
      source: inst.source,
      reportId: inst.report_id,
      question: inst.question,
      options: inst.options as [string, string, string, string],
      topic: allQuestions.find((q) => q.question === inst.question)?.topic,
      difficulty: allQuestions.find((q) => q.question === inst.question)?.difficulty,
    }));

    const response: StartQuizResponse = {
      success: true,
      sessionId: session.id,
      questions: clientQuestions,
      streaks: streakSummary,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[quiz/start]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
