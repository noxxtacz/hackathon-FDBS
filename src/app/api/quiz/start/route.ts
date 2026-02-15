import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { QuizQuestion } from "@/lib/types";

/**
 * GET /api/quiz/start
 * Public – returns a mix of 6 static + up to 4 community questions.
 */

const STATIC_QUESTIONS: QuizQuestion[] = [
  {
    id: "s1",
    question: "What is phishing?",
    options: [
      "A type of fishing sport",
      "A cyberattack that tricks you into revealing personal info",
      "A software update method",
      "A type of firewall",
    ],
    correctIndex: 1,
  },
  {
    id: "s2",
    question:
      "Which of these is a red flag in a suspicious email?",
    options: [
      "Sender address matches the company domain",
      "Professional language and grammar",
      "Urgent request to click a link immediately",
      "Email has an unsubscribe option",
    ],
    correctIndex: 2,
  },
  {
    id: "s3",
    question: "What does HTTPS indicate about a website?",
    options: [
      "The website is 100% safe",
      "The connection is encrypted between you and the server",
      "The website is government-approved",
      "The website has no ads",
    ],
    correctIndex: 1,
  },
  {
    id: "s4",
    question:
      "What should you do if you receive a suspicious SMS with a link?",
    options: [
      "Click the link to investigate",
      "Forward it to all your contacts",
      "Delete it and block the sender",
      "Reply asking who sent it",
    ],
    correctIndex: 2,
  },
  {
    id: "s5",
    question: "What is two-factor authentication (2FA)?",
    options: [
      "Using two different passwords",
      "An extra verification step beyond your password",
      "Having two email accounts",
      "Logging in from two devices",
    ],
    correctIndex: 1,
  },
  {
    id: "s6",
    question: "Which password is the strongest?",
    options: [
      "password123",
      "MyDog'sName",
      "Tr0ub4dor&3",
      "j7$kL9#mQ2!xP",
    ],
    correctIndex: 3,
  },
];

export async function GET() {
  try {
    // Fetch community-submitted approved quiz questions (if table exists)
    let communityQuestions: QuizQuestion[] = [];
    try {
      const { data } = await supabaseAdmin
        .from("quiz_questions")
        .select("id, question, options, correct_index")
        .eq("status", "approved")
        .limit(10);

      if (data && data.length > 0) {
        // Shuffle and pick up to 4
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 4);
        communityQuestions = shuffled.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          correctIndex: q.correct_index as number,
        }));
      }
    } catch {
      // Table may not exist yet – that's fine, use static only
    }

    const questions = [...STATIC_QUESTIONS, ...communityQuestions];

    // Shuffle final set
    const shuffled = questions.sort(() => Math.random() - 0.5);

    return NextResponse.json({ questions: shuffled });
  } catch (err) {
    console.error("[quiz/start]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
