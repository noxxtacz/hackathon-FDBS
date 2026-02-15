-- ============================================================
-- 005: Threat report votes (upvotes)
-- ============================================================
-- Each user can vote once per report. The unique constraint
-- prevents duplicates at the DB level. Deleting a report
-- cascades to its votes; deleting a user nullifies their votes.
-- ============================================================

create table if not exists public.threat_votes (
  id          uuid        primary key default gen_random_uuid(),
  report_id   uuid        not null references public.threat_reports(id) on delete cascade,
  user_id     uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- One vote per user per report
-- Using a partial index so NULLs in user_id (deleted users) are excluded
create unique index if not exists uq_vote_report_user
  on public.threat_votes (report_id, user_id)
  where user_id is not null;

-- Fast count of votes per report
create index if not exists idx_votes_report on public.threat_votes (report_id);

comment on table public.threat_votes is 'Upvotes on threat reports. One vote per user per report.';
