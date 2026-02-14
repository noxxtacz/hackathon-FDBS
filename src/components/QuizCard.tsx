"use client";

import Card from "./Card";

interface Props {
  question: string;
  options: string[];
  onAnswer: (index: number) => void;
  answered: boolean;
  selectedIndex: number | null;
  correctIndex: number;
}

export default function QuizCard({
  question,
  options,
  onAnswer,
  answered,
  selectedIndex,
  correctIndex,
}: Props) {
  return (
    <Card className="max-w-2xl">
      <p className="mb-5 text-lg font-semibold leading-relaxed text-white">{question}</p>

      <ul className="space-y-2">
        {options.map((opt, i) => {
          let style =
            "border border-white/10 bg-white/[0.02] text-gray-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-white";

          if (answered) {
            if (i === correctIndex)
              style = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
            else if (i === selectedIndex)
              style = "border-red-500/30 bg-red-500/10 text-red-400";
            else style = "border-white/5 bg-white/[0.01] text-gray-600";
          }

          return (
            <li key={i}>
              <button
                disabled={answered}
                onClick={() => onAnswer(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all duration-200 ${style}`}
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold opacity-60">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
