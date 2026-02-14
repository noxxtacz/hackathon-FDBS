"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import QuizCard from "@/components/QuizCard";
import Card from "@/components/Card";
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
        <Card className="max-w-md text-center">
          <p className="mb-4 text-gray-600">
            {QUESTIONS.length} questions. Let&apos;s see how you score!
          </p>
          <button
            onClick={() => setStarted(true)}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start Quiz
          </button>
        </Card>
      </>
    );
  }

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <>
        <PageHeader title="Quiz Complete!" />
        <Card className="max-w-md text-center">
          <p className="text-4xl font-bold text-gray-900">{pct}%</p>
          <p className="mt-2 text-gray-600">
            You got <span className="font-semibold">{score}</span> out of{" "}
            <span className="font-semibold">{QUESTIONS.length}</span> correct.
          </p>
          <button
            onClick={() => {
              setStarted(false);
              setFinished(false);
              setCurrentIdx(0);
              setScore(0);
              setAnswered(false);
              setSelectedIndex(null);
            }}
            className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </Card>
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

      <QuizCard
        question={q.question}
        options={q.options}
        onAnswer={handleAnswer}
        answered={answered}
        selectedIndex={selectedIndex}
        correctIndex={q.correctIndex}
      />

      {answered && (
        <button
          onClick={handleNext}
          className="mt-4 rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {currentIdx + 1 >= QUESTIONS.length ? "See Results" : "Next →"}
        </button>
      )}
    </>
  );
}
