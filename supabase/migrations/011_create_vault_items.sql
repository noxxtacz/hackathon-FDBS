-- ============================================================
-- 011: Vault items table + profile vault columns
-- ============================================================
-- Adds per-item encrypted vault storage and the password hash /
-- vault salt columns to profiles.
--
-- Security model:
--   • password_hash — argon2id hash of the user's vault password
--   • vault_salt_hex — random 16-byte salt (hex) for PBKDF2 key derivation
--   • Each vault_items row stores AES-256-GCM ciphertext + IV + authTag
--   • The derived key is NEVER stored
-- ============================================================

-- Add vault credential columns to profiles (idempotent)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'password_hash'
  ) then
    alter table public.profiles add column password_hash text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'vault_salt_hex'
  ) then
    alter table public.profiles add column vault_salt_hex text;
  end if;
end $$;

-- Encrypted vault items (one row per credential)
create table if not exists public.vault_items (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  label           text        not null,
  ciphertext_hex  text        not null,
  iv_hex          text        not null,
  auth_tag_hex    text        not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_vault_items_user on public.vault_items (user_id);

comment on table public.vault_items is 'Per-item AES-256-GCM encrypted vault entries. Decryption requires the user vault password at runtime.';
