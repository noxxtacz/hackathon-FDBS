/* ------------------------------------------------------------------
   Streak logic — pure helper, used by /api/streak routes
   ------------------------------------------------------------------ */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserStreak } from "@/lib/types";

/**
 * Returns today's date as YYYY-MM-DD in UTC.
 */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calculates the number of calendar days between two YYYY-MM-DD strings.
 */
function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.floor(
    (new Date(b).getTime() - new Date(a).getTime()) / msPerDay
  );
}

/**
 * Fetch the current streak row for a user.
 * Returns null if no row exists yet.
 */
export async function getStreak(userId: string): Promise<UserStreak | null> {
  const { data, error } = await supabaseAdmin
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserStreak | null;
}

/**
 * Core streak update logic:
 *  - No row → create with streak = 1
 *  - Same day → no-op
 *  - Consecutive day → increment
 *  - Gap > 1 day → reset to 1
 *  - Always update longest_streak when current exceeds it
 *
 * Returns the updated streak row.
 */
export async function updateStreak(userId: string): Promise<UserStreak> {
  const today = todayUTC();
  const existing = await getStreak(userId);

  // ── No existing row → first ever activity ──
  if (!existing) {
    const { data, error } = await supabaseAdmin
      .from("user_streaks")
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as UserStreak;
  }

  const lastDate = existing.last_activity_date;

  // ── Already recorded today → no-op ──
  if (lastDate === today) {
    return existing;
  }

  let newCurrent: number;

  if (lastDate && daysBetween(lastDate, today) === 1) {
    // Consecutive day → increment
    newCurrent = existing.current_streak + 1;
  } else {
    // Gap > 1 day (or null last_activity_date) → reset
    newCurrent = 1;
  }

  const newLongest = Math.max(existing.longest_streak, newCurrent);

  const { data, error } = await supabaseAdmin
    .from("user_streaks")
    .update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserStreak;
}
