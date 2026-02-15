-- ============================================================
-- 012: Add status column to threat_reports
-- ============================================================
-- Adds a status workflow so reports can be moderated.
-- Default is 'approved' for the hackathon (no moderation gate).
-- ============================================================

alter table public.threat_reports
  add column if not exists status text not null default 'approved'
  check (status in ('pending', 'approved', 'rejected'));

create index if not exists idx_reports_status on public.threat_reports (status);
