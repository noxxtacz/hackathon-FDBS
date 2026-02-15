/* ------------------------------------------------------------------
   Quiz Game — Zod schemas & derived TypeScript types
   ------------------------------------------------------------------ */

import { z } from "zod";

/* ── Shared enums ──────────────────────────────────────────── */

export const TopicEnum = z.enum([
  "phishing",
  "passwords",
  "social_engineering",
  "malware",
  "general",
]);
export type Topic = z.infer<typeof TopicEnum>;

export const DifficultyEnum = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const QuestionSourceEnum = z.enum(["report_generated", "general_db"]);
export type QuestionSource = z.infer<typeof QuestionSourceEnum>;

/* ── Quiz question (internal — includes correct answer) ───── */

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().default(""),
  tip: z.string().default(""),
  source: QuestionSourceEnum,
  reportId: z.string().nullable().default(null),
  topic: TopicEnum.optional().default("general"),
  difficulty: DifficultyEnum.optional().default("medium"),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

/* ── Groq output — array of questions ─────────────────────── */

export const GroqQuestionsSchema = z.array(
  z.object({
    question: z.string().min(1),
    options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().default(""),
    tip: z.string().default(""),
  })
);

/* ── Request / response schemas ───────────────────────────── */

export const StartQuizRequestSchema = z.object({
  count: z.number().int().min(1).max(10).default(5),
  topic: TopicEnum.optional(),
  difficulty: DifficultyEnum.optional(),
});
export type StartQuizRequest = z.infer<typeof StartQuizRequestSchema>;

/** Returned to client — correctIndex is STRIPPED */
export interface ClientQuestion {
  id: string;
  source: QuestionSource;
  reportId: string | null;
  question: string;
  options: [string, string, string, string];
  topic?: Topic;
  difficulty?: Difficulty;
}

export interface StreakSummary {
  daily: { current: number; best: number; lastQuizDate: string | null };
  answer: { current: number; best: number };
}

export interface StartQuizResponse {
  success: true;
  sessionId: string;
  questions: ClientQuestion[];
  streaks: StreakSummary;
}

export const AnswerRequestSchema = z.object({
  sessionId: z.string().uuid(),
  questionInstanceId: z.string().uuid(),
  selectedIndex: z.number().int().min(0).max(3),
});
export type AnswerRequest = z.infer<typeof AnswerRequestSchema>;

export interface AnswerResponse {
  success: true;
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  tip: string;
  streaks: { answer: { current: number; best: number } };
}

export const FinishRequestSchema = z.object({
  sessionId: z.string().uuid(),
});
export type FinishRequest = z.infer<typeof FinishRequestSchema>;

export interface FinishResponse {
  success: true;
  summary: { total: number; correct: number; percent: number };
  streaks: StreakSummary;
}
