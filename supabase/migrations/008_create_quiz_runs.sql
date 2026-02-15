-- ============================================================
-- 008: Quiz run results
-- ============================================================
-- Each row is one completed quiz attempt. Used for dashboard
-- stats (total attempts, average score) and leaderboard.
-- ============================================================

create table if not exists public.quiz_runs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  score       int         not null check (score >= 0),
  created_at  timestamptz not null default now()
);

create index if not exists idx_quiz_runs_user       on public.quiz_runs (user_id);
create index if not exists idx_quiz_runs_created_at on public.quiz_runs (created_at desc);

comment on table public.quiz_runs is 'Completed quiz attempts with scores.';
