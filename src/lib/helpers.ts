/* ------------------------------------------------------------------
   Shared helper utilities
   ------------------------------------------------------------------ */

/**
 * Mask an email for public display.
 * "alice@example.com" → "a***@example.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local.charAt(0)}***@${domain}`;
}
