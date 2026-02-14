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
    <Card className="max-w-xl">
      <p className="mb-4 text-lg font-medium text-gray-900">{question}</p>

      <ul className="space-y-2">
        {options.map((opt, i) => {
          let style =
            "border border-gray-200 hover:border-blue-400 hover:bg-blue-50";

          if (answered) {
            if (i === correctIndex) style = "border-2 border-green-500 bg-green-50";
            else if (i === selectedIndex)
              style = "border-2 border-red-400 bg-red-50";
            else style = "border border-gray-200 opacity-60";
          }

          return (
            <li key={i}>
              <button
                disabled={answered}
                onClick={() => onAnswer(i)}
                className={`w-full rounded-lg px-4 py-2 text-left text-sm transition-colors ${style}`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
