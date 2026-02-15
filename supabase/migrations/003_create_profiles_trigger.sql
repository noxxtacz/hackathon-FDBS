-- ============================================================
-- 003: Auto-create a profile row on new auth user sign-up
-- ============================================================
-- This trigger fires AFTER INSERT on auth.users.  It inserts a
-- skeleton profile so the API never has to handle "profile
-- doesn't exist yet" edge cases.
--
-- display_name is derived from the email local part as a
-- sensible default the user can change later.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer          -- runs with table-owner privileges
set search_path = ''      -- prevent search_path injection
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$;

-- Drop first so the migration is idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

comment on function public.handle_new_user() is
  'Auto-creates a public.profiles row when a new auth user signs up.';
