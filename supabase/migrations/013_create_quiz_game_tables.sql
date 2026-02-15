-- ============================================================
-- 013: Quiz game — sessions, question instances, general bank
-- ============================================================
-- Adds the full quiz-game schema:
--   • general_questions: pre-seeded cybersecurity question bank
--   • quiz_sessions: tracks each quiz attempt with scoring
--   • quiz_question_instances: per-question state within a session
--
-- The existing user_streaks table is extended with answer-streak
-- columns for in-session consecutive-correct tracking.
-- ============================================================

-- ── General question bank ──────────────────────────────────

create table if not exists public.general_questions (
  id            uuid  primary key default gen_random_uuid(),
  topic         text  not null check (topic in ('phishing','passwords','social_engineering','malware','general')),
  difficulty    text  not null check (difficulty in ('easy','medium','hard')),
  question      text  not null,
  options       jsonb not null,          -- ["A","B","C","D"]
  correct_index int   not null check (correct_index between 0 and 3),
  explanation   text  not null default '',
  tip           text  not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists idx_gq_topic      on public.general_questions (topic);
create index if not exists idx_gq_difficulty  on public.general_questions (difficulty);

-- ── Quiz sessions ──────────────────────────────────────────

create table if not exists public.quiz_sessions (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  total_questions  int        not null default 0,
  correct_count   int        not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_qs_user on public.quiz_sessions (user_id);

-- ── Quiz question instances ────────────────────────────────

create table if not exists public.quiz_question_instances (
  id              uuid  primary key default gen_random_uuid(),
  session_id      uuid  not null references public.quiz_sessions(id) on delete cascade,
  source          text  not null check (source in ('report_generated','general_db')),
  report_id       uuid  references public.threat_reports(id) on delete set null,
  question        text  not null,
  options         jsonb not null,
  correct_index   int   not null check (correct_index between 0 and 3),
  explanation     text  not null default '',
  tip             text  not null default '',
  answered_index  int,
  is_correct      boolean,
  sort_order      int   not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_qqi_session on public.quiz_question_instances (session_id);

-- ── Extend user_streaks for answer streaks ─────────────────

alter table public.user_streaks
  add column if not exists current_answer_streak int not null default 0,
  add column if not exists best_answer_streak    int not null default 0;
