/* ------------------------------------------------------------------
   Input-validation & sanitisation helpers used by API route handlers
   ------------------------------------------------------------------ */

/** Strip HTML tags to prevent stored-XSS. */
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** Collapse whitespace and trim. */
export function sanitize(input: string): string {
  return stripTags(input).replace(/\s+/g, " ").trim();
}

/** Return true if the string looks like a plausible URL. */
export function isUrl(value: string): boolean {
  try {
    const u = new URL(
      value.startsWith("http") ? value : `https://${value}`
    );
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

/** Clamp a number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Lightweight Tunisian governorate list for validation. */
export const GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili",
] as const;

export type Governorate = (typeof GOVERNORATES)[number];

/** Check if a value is one of the 24 Tunisian governorates. */
export function isGovernorate(v: string): v is Governorate {
  return (GOVERNORATES as readonly string[]).includes(v);
}
