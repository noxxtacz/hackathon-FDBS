-- ============================================================
-- 009: Reusable updated_at trigger
-- ============================================================
-- A single function attached to every table that has an
-- updated_at column.  Automatically sets the timestamp on
-- every UPDATE so the API never needs to do it manually.
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Generic trigger function that stamps updated_at = now() on every row update.';

-- ── Attach to all tables with updated_at ──

drop trigger if exists trg_profiles_updated     on public.profiles;
drop trigger if exists trg_user_streaks_updated on public.user_streaks;
drop trigger if exists trg_vault_blobs_updated  on public.vault_blobs;

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_user_streaks_updated
  before update on public.user_streaks
  for each row execute function public.set_updated_at();

create trigger trg_vault_blobs_updated
  before update on public.vault_blobs
  for each row execute function public.set_updated_at();
