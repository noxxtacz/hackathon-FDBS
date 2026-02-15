-- ============================================================
-- 001: Enable required PostgreSQL extensions
-- ============================================================
-- pgcrypto provides gen_random_uuid() for UUID primary keys.
-- This is idempotent — safe to run multiple times.
-- ============================================================

create extension if not exists "pgcrypto";
