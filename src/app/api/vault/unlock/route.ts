import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  hashPassword,
  verifyPassword,
  generateVaultSalt,
} from "@/lib/cryptoVault";
import {
  getUserVaultProfile,
  setUserVaultCredentials,
} from "@/lib/vaultDb";

/**
 * POST /api/vault/unlock
 * Body: { password: string }
 *
 * First call (vault setup):
 *   - Hash password with argon2id
 *   - Generate vault salt
 *   - Store both on profile
 *   - Return { ok: true, setup: true }
 *
 * Subsequent calls:
 *   - Verify password against stored hash
 *   - Return { ok: true } on success
 *   - Return 401 on mismatch
 *
 * NEVER returns the derived key or the hash.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const password: unknown = body?.password;

    if (typeof password !== "string" || password.length < 1) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const profile = await getUserVaultProfile(user.id);

    // ── First-time vault setup ──
    if (!profile?.password_hash || !profile?.vault_salt_hex) {
      const passwordHash = await hashPassword(password);
      const vaultSalt = generateVaultSalt();

      await setUserVaultCredentials(
        user.id,
        passwordHash,
        vaultSalt.toString("hex")
      );

      return NextResponse.json({ ok: true, setup: true });
    }

    // ── Verify existing password ──
    const valid = await verifyPassword(profile.password_hash, password);

    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect vault password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[vault/unlock]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
