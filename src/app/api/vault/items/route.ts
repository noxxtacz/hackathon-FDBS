import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  verifyPassword,
  deriveVaultKey,
  encryptVaultItem,
  decryptVaultItem,
} from "@/lib/cryptoVault";
import {
  getUserVaultProfile,
  createVaultItem,
  listVaultItems,
} from "@/lib/vaultDb";

/* ── Helper: authenticate + verify vault password ─────────── */

async function authenticateAndDeriveKey(
  password: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>
) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: "Authentication required", status: 401 } as const;
  }

  const profile = await getUserVaultProfile(user.id);

  if (!profile?.password_hash || !profile?.vault_salt_hex) {
    return { error: "Vault not set up. Call /api/vault/unlock first.", status: 400 } as const;
  }

  const valid = await verifyPassword(profile.password_hash, password);
  if (!valid) {
    return { error: "Incorrect vault password", status: 401 } as const;
  }

  const key = deriveVaultKey(
    password,
    Buffer.from(profile.vault_salt_hex, "hex")
  );

  return { user, key } as const;
}

/**
 * POST /api/vault/items
 * Body: { password, label, secret }
 *
 * Verifies vault password, derives key, encrypts the secret,
 * stores the encrypted item, and returns metadata only.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();
    const { password, label, secret } = body ?? {};

    if (typeof password !== "string" || password.length < 1) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }
    if (typeof label !== "string" || label.trim().length === 0) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }
    if (typeof secret !== "string" || secret.length === 0) {
      return NextResponse.json({ error: "Secret is required" }, { status: 400 });
    }

    const auth = await authenticateAndDeriveKey(password, supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Encrypt the secret with AES-256-GCM
    const encrypted = encryptVaultItem(secret, auth.key);

    // Store encrypted item
    const item = await createVaultItem(
      auth.user.id,
      label.trim(),
      encrypted.ciphertextHex,
      encrypted.ivHex,
      encrypted.authTagHex
    );

    return NextResponse.json(
      {
        id: item.id,
        label: item.label,
        created_at: item.created_at,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[vault/items POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST-style GET alternative:
 * Since decryption requires the password, we use a POST-based
 * decrypt endpoint. However for listing encrypted metadata only,
 * a standard GET works.
 *
 * GET /api/vault/items
 * Returns item list WITHOUT decrypted secrets (labels + timestamps only).
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const items = await listVaultItems(user.id);

    // Return metadata only — no ciphertext, no secrets
    const safe = items.map((item) => ({
      id: item.id,
      label: item.label,
      created_at: item.created_at,
    }));

    return NextResponse.json({ items: safe });
  } catch (err) {
    console.error("[vault/items GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/vault/items
 * Body: { password }
 *
 * Decrypts and returns ALL vault items.
 * Uses PUT to avoid GET-with-body issues.
 */
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();
    const { password } = body ?? {};

    if (typeof password !== "string" || password.length < 1) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const auth = await authenticateAndDeriveKey(password, supabase);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const items = await listVaultItems(auth.user.id);

    // Decrypt each item
    const decrypted = items.map((item) => {
      try {
        const secret = decryptVaultItem(
          {
            ciphertextHex: item.ciphertext_hex,
            ivHex: item.iv_hex,
            authTagHex: item.auth_tag_hex,
          },
          auth.key
        );
        return {
          id: item.id,
          label: item.label,
          secret,
          created_at: item.created_at,
        };
      } catch {
        // Decryption failure — item may be corrupted
        return {
          id: item.id,
          label: item.label,
          secret: null,
          error: "Decryption failed",
          created_at: item.created_at,
        };
      }
    });

    return NextResponse.json({ items: decrypted });
  } catch (err) {
    console.error("[vault/items PUT/decrypt]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
