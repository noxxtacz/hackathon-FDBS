/* ------------------------------------------------------------------
   Server-side vault cryptography helpers
   ------------------------------------------------------------------
   Security model:
   - Passwords hashed with argon2id (never stored in plaintext)
   - Per-user vault salt stored in DB (vaultSaltHex on profiles)
   - Encryption key derived via PBKDF2-SHA256 (100k iterations)
   - Each vault item encrypted with AES-256-GCM + fresh 12-byte IV
   - DB stores ciphertext + iv + authTag — never the key
   ------------------------------------------------------------------ */

import crypto from "crypto";
import argon2 from "argon2";

/* ── Constants ──────────────────────────────────────────────── */

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = "sha256";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/* ── Salt generation ────────────────────────────────────────── */

/** Generate a cryptographically random vault salt (16 bytes). */
export function generateVaultSalt(): Buffer {
  return crypto.randomBytes(16);
}

/* ── Password hashing (argon2id) ────────────────────────────── */

/** Hash a password with argon2id. Returns an encoded hash string. */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/** Verify a password against an argon2 hash. */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

/* ── Key derivation ─────────────────────────────────────────── */

/**
 * Derive a 32-byte AES-256 key from the user's password + vault salt.
 * Uses PBKDF2 with SHA-256 and 100,000 iterations.
 * NEVER store the returned key — derive it at runtime only.
 */
export function deriveVaultKey(password: string, vaultSalt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    vaultSalt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST
  );
}

/* ── AES-256-GCM encryption ────────────────────────────────── */

export interface EncryptedPayload {
  ciphertextHex: string;
  ivHex: string;
  authTagHex: string;
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Each call generates a fresh random IV.
 */
export function encryptVaultItem(
  plaintext: string,
  key: Buffer
): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    ciphertextHex: encrypted.toString("hex"),
    ivHex: iv.toString("hex"),
    authTagHex: cipher.getAuthTag().toString("hex"),
  };
}

/**
 * Decrypt an AES-256-GCM payload back to plaintext.
 * Throws on authentication failure (tampered data, wrong key).
 */
export function decryptVaultItem(
  payload: EncryptedPayload,
  key: Buffer
): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(payload.ivHex, "hex"),
    { authTagLength: AUTH_TAG_LENGTH }
  );

  decipher.setAuthTag(Buffer.from(payload.authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertextHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
