/* ------------------------------------------------------------------
   Quiz Game — Streak computation (pure functions, no DB)
   ------------------------------------------------------------------ */

export interface DailyStreakUpdate {
  current: number;
  best: number;
  lastQuizDate: string;
}

/**
 * Compute the new daily streak values.
 * Rules:
 *   - same day → no change
 *   - consecutive day → current + 1
 *   - gap > 1 day → reset to 1
 *   - best = max(best, current)
 */
export function computeDailyStreakUpdate(
  lastQuizDate: string | null,
  today: string, // YYYY-MM-DD
  current: number,
  best: number
): DailyStreakUpdate {
  if (lastQuizDate === today) {
    return { current, best, lastQuizDate: today };
  }

  let newCurrent: number;

  if (lastQuizDate) {
    const last = new Date(lastQuizDate + "T00:00:00Z");
    const now = new Date(today + "T00:00:00Z");
    const diffDays = Math.round(
      (now.getTime() - last.getTime()) / 86_400_000
    );

    newCurrent = diffDays === 1 ? current + 1 : 1;
  } else {
    newCurrent = 1;
  }

  return {
    current: newCurrent,
    best: Math.max(best, newCurrent),
    lastQuizDate: today,
  };
}

export interface AnswerStreakUpdate {
  current: number;
  best: number;
}

/**
 * Update the in-session answer streak.
 *   - correct → current + 1
 *   - incorrect → reset to 0
 *   - best = max(best, current)
 */
export function updateAnswerStreak(
  isCorrect: boolean,
  current: number,
  best: number
): AnswerStreakUpdate {
  const newCurrent = isCorrect ? current + 1 : 0;
  return {
    current: newCurrent,
    best: Math.max(best, newCurrent),
  };
}
