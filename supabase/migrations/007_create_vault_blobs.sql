-- ============================================================
-- 007: Encrypted password vault (zero-knowledge)
-- ============================================================
-- The client derives a key from the user's master password
-- using the stored salt + KDF parameters, then encrypts/
-- decrypts locally.  The server never sees plaintext.
--
-- • salt        – random salt used for key derivation
-- • kdf_params  – algorithm config (iterations, hash, etc.)
-- • encrypted_blob – the AES-GCM ciphertext (base64)
-- ============================================================

create table if not exists public.vault_blobs (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  salt            text  not null,
  kdf_params      jsonb not null,
  encrypted_blob  text  not null,
  updated_at      timestamptz not null default now()
);

comment on table public.vault_blobs is 'Client-side encrypted password vaults. Server stores opaque ciphertext only.';
