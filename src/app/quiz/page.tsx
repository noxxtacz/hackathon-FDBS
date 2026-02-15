"use client";

import { useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import QuizCard from "@/components/QuizCard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/i18n";

/* ── Types matching API responses ──────────────────────────── */

interface ClientQuestion {
  id: string;
  source: "report_generated" | "general_db";
  reportId: string | null;
  question: string;
  options: [string, string, string, string];
  topic?: string;
  difficulty?: string;
}

interface StreakSummary {
  daily: { current: number; best: number; lastQuizDate: string | null };
  answer: { current: number; best: number };
}

interface AnswerResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  tip: string;
}

const TOPICS = [
  { value: "", label: "All Topics" },
  { value: "phishing", label: "Phishing" },
  { value: "passwords", label: "Passwords" },
  { value: "social_engineering", label: "Social Engineering" },
  { value: "malware", label: "Malware" },
  { value: "general", label: "General" },
];

const DIFFICULTIES = [
  { value: "", label: "Mixed" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const COUNTS = [3, 5, 7, 10];

const selectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 backdrop-blur transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";

/* ── Component ──────────────────────────────────────────────── */

export default function QuizPage() {
  const { language } = useLanguage();

  // Config
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(5);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [streaks, setStreaks] = useState<StreakSummary | null>(null);

  // Answer state
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answerStreak, setAnswerStreak] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finishSummary, setFinishSummary] = useState<{
    total: number;
    correct: number;
    percent: number;
    streaks: StreakSummary;
  } | null>(null);
  const [error, setError] = useState("");

  /* ── Start quiz ──────────────────────────────────────────── */

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setError("");
    setFinished(false);
    setFinishSummary(null);
    setScore(0);
    setCurrentIdx(0);
    setAnswerResult(null);
    setSelectedIndex(null);
    setAnswerStreak(0);

    try {
      const body: Record<string, unknown> = { count, language };
      if (topic) body.topic = topic;
      if (difficulty) body.difficulty = difficulty;

      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        setError(t("quiz.loginRequired", language));
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start quiz");
        return;
      }

      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setStreaks(data.streaks);
    } catch {
      setError("Failed to start quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [count, topic, difficulty, language]);

  /* ── Answer question ─────────────────────────────────────── */

  async function handleAnswer(idx: number) {
    if (!sessionId || answering || answerResult) return;

    setSelectedIndex(idx);
    setAnswering(true);

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionInstanceId: questions[currentIdx].id,
          selectedIndex: idx,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit answer");
        return;
      }

      setAnswerResult({
        isCorrect: data.isCorrect,
        correctIndex: data.correctIndex,
        explanation: data.explanation,
        tip: data.tip,
      });

      if (data.isCorrect) {
        setScore((s) => s + 1);
        setAnswerStreak(data.streaks.answer.current);
      } else {
        setAnswerStreak(0);
      }

      if (data.streaks) {
        setStreaks((prev) =>
          prev ? { ...prev, answer: data.streaks.answer } : prev
        );
      }
    } catch {
      setError("Failed to submit answer");
    } finally {
      setAnswering(false);
    }
  }

  /* ── Next / Finish ───────────────────────────────────────── */

  async function handleNext() {
    if (currentIdx + 1 >= questions.length) {
      // Finish the quiz
      await finishQuiz();
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswerResult(null);
      setSelectedIndex(null);
    }
  }

  async function finishQuiz() {
    if (!sessionId) return;

    try {
      const res = await fetch("/api/quiz/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (res.ok) {
        setFinishSummary({
          total: data.summary.total,
          correct: data.summary.correct,
          percent: data.summary.percent,
          streaks: data.streaks,
        });
        setStreaks(data.streaks);
      }
    } catch {
      // Still show the finish screen even if the API call fails
    }

    setFinished(true);
  }

  /* ── Render: Start Screen ────────────────────────────────── */

  if (!sessionId && !loading) {
    return (
      <>
        <PageHeader
          title={t("quiz.title", language)}
          subtitle={t("quiz.subtitle", language)}
        />

        <div className="mx-auto max-w-lg">
          <Card className="text-center">
            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-1 text-lg font-semibold text-white">{t("quiz.configure", language)}</h2>
            <p className="mb-5 text-sm text-gray-500">
              {t("quiz.configSubtitle", language)}
            </p>

            {/* Config options */}
            <div className="space-y-4 text-left">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("quiz.topic", language)}
                </label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className={selectClass + " w-full"}>
                  {TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("quiz.difficulty", language)}
                </label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectClass + " w-full"}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("quiz.questions", language)}
                </label>
                <div className="flex gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCount(c)}
                      className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                        count === c
                          ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                          : "border-white/10 bg-white/5 text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={startQuiz} className="mt-6 w-full">
              {t("quiz.start", language)}
            </Button>

            {error && (
              <div className="mt-4">
                <Toast type="error" message={error} onDismiss={() => setError("")} />
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  /* ── Render: Loading ─────────────────────────────────────── */

  if (loading) {
    return (
      <>
        <PageHeader title={t("quiz.title", language)} subtitle={t("quiz.preparing", language)} />
        <LoadingSpinner />
      </>
    );
  }

  /* ── Render: Finished ────────────────────────────────────── */

  if (finished) {
    const pct = finishSummary?.percent ?? Math.round((score / questions.length) * 100);
    const correct = finishSummary?.correct ?? score;
    const total = finishSummary?.total ?? questions.length;
    const s = streaks;

    const color =
      pct >= 80
        ? "text-emerald-400 border-emerald-500/30"
        : pct >= 50
          ? "text-yellow-400 border-yellow-500/30"
          : "text-red-400 border-red-500/30";

    return (
      <>
        <PageHeader title={t("quiz.complete", language)} />
        <div className="mx-auto max-w-md">
          <Card className="animate-slide-up text-center">
            {/* Score circle */}
            <div className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-2 ${color}`}>
              <span className={`text-4xl font-bold ${color.split(" ")[0]}`}>{pct}%</span>
            </div>

            <p className="text-gray-400">
              {t("quiz.gotCorrect", language)}: <span className="font-semibold text-white">{correct}</span> / <span className="font-semibold text-white">{total}</span>
            </p>

            {/* Streak badges */}
            {s && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-orange-500/10 bg-orange-500/5 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-orange-400">
                    {s.daily.current}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-orange-400/60">
                    {t("streak.daily", language)}
                  </p>
                  <p className="text-[10px] text-gray-600">{t("streak.best", language)}: {s.daily.best}</p>
                </div>
                <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {s.answer.best}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-400/60">
                    {t("quiz.bestAnswerStreak", language)}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {t("quiz.consecutiveCorrect", language)}
                  </p>
                </div>
              </div>
            )}

            {pct < 80 && (
              <p className="mt-3 text-sm text-gray-500">
                {t("quiz.reviewTip", language)}
              </p>
            )}

            <Button
              onClick={() => {
                setSessionId(null);
                setQuestions([]);
                setFinished(false);
                setFinishSummary(null);
                setError("");
              }}
              variant="secondary"
              className="mt-5 w-full"
            >
              {t("quiz.playAgain", language)}
            </Button>
          </Card>
        </div>
      </>
    );
  }

  /* ── Render: Question ────────────────────────────────────── */

  const q = questions[currentIdx];

  return (
    <>
      <PageHeader
        title={t("quiz.title", language)}
        subtitle={`${t("quiz.question", language)} ${currentIdx + 1} ${t("quiz.of", language)} ${questions.length}`}
      />

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
          style={{
            width: `${((currentIdx + (answerResult ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Stats bar */}
      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            {t("quiz.score", language)}: <span className="font-medium text-white">{score}/{questions.length}</span>
          </span>
          {answerStreak > 1 && (
            <span className="flex items-center gap-1 text-orange-400">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c.4 0 .7.2.9.5l3.4 5.8 6.5 1a1 1 0 01.6 1.7l-4.7 4.6 1.1 6.5a1 1 0 01-1.5 1l-5.8-3-5.8 3a1 1 0 01-1.5-1l1.1-6.5L1.6 11a1 1 0 01.6-1.7l6.5-1L12.1 2.5a1 1 0 01.9-.5z" />
              </svg>
              {answerStreak} {t("quiz.streak", language)}
            </span>
          )}
        </div>
        {q.source === "report_generated" && (
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
            {t("quiz.fromReport", language)}
          </span>
        )}
      </div>

      {/* Question card */}
      <QuizCard
        question={q.question}
        options={q.options}
        onAnswer={handleAnswer}
        answered={!!answerResult}
        selectedIndex={selectedIndex}
        correctIndex={answerResult?.correctIndex ?? -1}
      />

      {/* Explanation + tip after answering */}
      {answerResult && (
        <div className="mt-4 animate-slide-up space-y-3">
          {/* Correct/Incorrect banner */}
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              answerResult.isCorrect
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                : "border-red-500/20 bg-red-500/5 text-red-400"
            }`}
          >
            <span className="font-semibold">
              {answerResult.isCorrect ? t("quiz.correct", language) : t("quiz.incorrect", language)}
            </span>
            {answerResult.explanation && (
              <p className="mt-1 text-xs text-gray-400">{answerResult.explanation}</p>
            )}
          </div>

          {/* Tip */}
          {answerResult.tip && (
            <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-2.5 text-sm text-cyan-300">
              <span className="font-semibold">{t("quiz.tip", language)}:</span> {answerResult.tip}
            </div>
          )}

          <Button variant="primary" onClick={handleNext}>
            {currentIdx + 1 >= questions.length ? t("quiz.seeResults", language) : t("quiz.next", language)}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Toast type="error" message={error} onDismiss={() => setError("")} />
        </div>
      )}
    </>
  );
}
