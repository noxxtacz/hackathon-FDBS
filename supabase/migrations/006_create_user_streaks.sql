-- ============================================================
-- 006: Daily streak tracking
-- ============================================================
-- One row per user. The API bumps current_streak daily and
-- resets it when the user misses a day.  longest_streak is
-- updated whenever current_streak exceeds it.
-- ============================================================

create table if not exists public.user_streaks (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  current_streak      int  not null default 0,
  longest_streak      int  not null default 0,
  last_activity_date  date,
  updated_at          timestamptz not null default now()
);

comment on table public.user_streaks is 'Per-user daily activity streak counters.';
