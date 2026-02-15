-- ============================================================
-- 004: Community threat reports
-- ============================================================
-- Central table for user-submitted cyber threat sightings.
-- created_by is SET NULL on user deletion so reports survive
-- even if the author leaves the platform.
--
-- Indexes cover the most common query patterns:
--   • chronological feed  (created_at)
--   • user history        (created_by)
--   • geographic filter   (governorate)
--   • category filter     (threat_type)
--   • severity sort       (risk_score)
-- ============================================================

create table if not exists public.threat_reports (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  created_by    uuid        references auth.users(id) on delete set null,
  threat_type   text        not null,
  governorate   text        not null,
  url_defanged  text,
  description   text,
  solution      text,
  risk_score    int         not null default 0 check (risk_score between 0 and 100),
  risk_label    text        not null check (risk_label in ('safe', 'suspicious', 'dangerous')),
  risk_reasons  jsonb       not null default '[]'::jsonb,
  image_path    text
);

-- Performance indexes
create index if not exists idx_reports_created_at  on public.threat_reports (created_at  desc);
create index if not exists idx_reports_created_by  on public.threat_reports (created_by);
create index if not exists idx_reports_governorate on public.threat_reports (governorate);
create index if not exists idx_reports_threat_type on public.threat_reports (threat_type);
create index if not exists idx_reports_risk_score  on public.threat_reports (risk_score  desc);

comment on table public.threat_reports is 'Community-submitted cyber threat reports.';
