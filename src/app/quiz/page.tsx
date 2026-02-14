"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import QuizCard from "@/components/QuizCard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import type { QuizQuestion } from "@/lib/types";

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which of the following is a common sign of a phishing email?",
    options: [
      "Sent from a known contact",
      "Contains spelling errors and urgent language",
      "Includes a company logo",
      "Has a normal greeting",
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "What does HTTPS in a URL indicate?",
    options: [
      "The site is always safe",
      "Encrypted connection between browser and server",
      "The site is government-approved",
      "The site has no ads",
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "What should you do if you receive a suspicious link via SMS?",
    options: [
      "Click it to check",
      "Forward it to friends",
      "Do not click — report it",
      "Reply to ask who sent it",
    ],
    correctIndex: 2,
  },
  {
    id: 4,
    question: "Which password is the strongest?",
    options: [
      "password123",
      "MyDog'sName",
      "j8$Kq!2xLm@9",
      "123456",
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    question: "What is two-factor authentication (2FA)?",
    options: [
      "Using two passwords",
      "An extra verification step beyond your password",
      "Logging in from two devices",
      "Having two email accounts",
    ],
    correctIndex: 1,
  },
];

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  function handleAnswer(idx: number) {
    setSelectedIndex(idx);
    setAnswered(true);
    if (idx === QUESTIONS[currentIdx].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentIdx + 1 >= QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setAnswered(false);
      setSelectedIndex(null);
    }
  }

  if (!started) {
    return (
      <>
        <PageHeader
          title="Security Quiz"
          subtitle="Test your cybersecurity knowledge."
        />
        <div className="flex justify-center">
          <Card className="max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
            </div>
            <p className="mb-5 text-gray-400">
              {QUESTIONS.length} questions. Let&apos;s see how you score!
            </p>
            <Button onClick={() => setStarted(true)} className="w-full">
              Start Quiz
            </Button>
          </Card>
        </div>
      </>
    );
  }

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const color = pct >= 80 ? "text-emerald-400 border-emerald-500/30" : pct >= 50 ? "text-yellow-400 border-yellow-500/30" : "text-red-400 border-red-500/30";
    return (
      <>
        <PageHeader title="Quiz Complete!" />
        <div className="flex justify-center">
          <Card className="max-w-md text-center animate-slide-up">
            <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 ${color} mb-4`}>
              <span className={`text-4xl font-bold ${color.split(' ')[0]}`}>{pct}%</span>
            </div>
            <p className="text-gray-400">
              You got <span className="font-semibold text-white">{score}</span> out of{" "}
              <span className="font-semibold text-white">{QUESTIONS.length}</span> correct.
            </p>
            {pct < 80 && (
              <p className="mt-2 text-sm text-gray-500">Tip: Review phishing indicators and password best practices.</p>
            )}
            <Button
              onClick={() => {
                setStarted(false);
                setFinished(false);
                setCurrentIdx(0);
                setScore(0);
                setAnswered(false);
                setSelectedIndex(null);
              }}
              variant="secondary"
              className="mt-5 w-full"
            >
              Retry Quiz
            </Button>
          </Card>
        </div>
      </>
    );
  }

  const q = QUESTIONS[currentIdx];

  return (
    <>
      <PageHeader
        title="Security Quiz"
        subtitle={`Question ${currentIdx + 1} of ${QUESTIONS.length}`}
      />

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
          style={{ width: `${((currentIdx + (answered ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <QuizCard
        question={q.question}
        options={q.options}
        onAnswer={handleAnswer}
        answered={answered}
        selectedIndex={selectedIndex}
        correctIndex={q.correctIndex}
      />

      {answered && (
        <div className="mt-4">
          <Button variant="primary" onClick={handleNext}>
            {currentIdx + 1 >= QUESTIONS.length ? "See Results" : "Next →"}
          </Button>
        </div>
      )}
    </>
  );
}
