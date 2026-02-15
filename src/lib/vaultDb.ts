/* ------------------------------------------------------------------
   Vault database helpers — thin wrappers around supabaseAdmin
   ------------------------------------------------------------------ */

import { supabaseAdmin } from "@/lib/supabase/admin";

/* ── Types ──────────────────────────────────────────────────── */

export interface VaultItemRow {
  id: string;
  user_id: string;
  label: string;
  ciphertext_hex: string;
  iv_hex: string;
  auth_tag_hex: string;
  created_at: string;
}

export interface UserVaultProfile {
  user_id: string;
  password_hash: string | null;
  vault_salt_hex: string | null;
}

/* ── Profile vault fields ───────────────────────────────────── */

/**
 * Fetch vault-related fields from the user's profile.
 */
export async function getUserVaultProfile(
  userId: string
): Promise<UserVaultProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, password_hash, vault_salt_hex")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserVaultProfile | null;
}

/**
 * Store the hashed password and vault salt on the user's profile.
 * Called once during vault setup (first unlock).
 */
export async function setUserVaultCredentials(
  userId: string,
  passwordHash: string,
  vaultSaltHex: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ password_hash: passwordHash, vault_salt_hex: vaultSaltHex })
    .eq("user_id", userId);

  if (error) throw error;
}

/* ── Vault items CRUD ───────────────────────────────────────── */

export async function createVaultItem(
  userId: string,
  label: string,
  ciphertextHex: string,
  ivHex: string,
  authTagHex: string
): Promise<VaultItemRow> {
  const { data, error } = await supabaseAdmin
    .from("vault_items")
    .insert({
      user_id: userId,
      label,
      ciphertext_hex: ciphertextHex,
      iv_hex: ivHex,
      auth_tag_hex: authTagHex,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as VaultItemRow;
}

export async function listVaultItems(
  userId: string
): Promise<VaultItemRow[]> {
  const { data, error } = await supabaseAdmin
    .from("vault_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as VaultItemRow[];
}

export async function deleteVaultItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const { error, count } = await supabaseAdmin
    .from("vault_items")
    .delete({ count: "exact" })
    .eq("id", itemId)
    .eq("user_id", userId); // ownership check

  if (error) throw error;
  return (count ?? 0) > 0;
}
