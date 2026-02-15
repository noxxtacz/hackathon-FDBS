-- ============================================================
-- 002: User profiles
-- ============================================================
-- One profile per authenticated user. The user_id is both the
-- PK and a FK to auth.users, so deleting the auth user cascades
-- and removes the profile automatically.
-- ============================================================

create table if not exists public.profiles (
  user_id       uuid        primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Public user profiles, one per auth.users row.';
