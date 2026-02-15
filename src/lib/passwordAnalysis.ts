/* ------------------------------------------------------------------
   Password entropy & pattern-detection helpers
   ------------------------------------------------------------------
   Pure functions — no I/O, no secrets logged.
   ------------------------------------------------------------------ */

/* ── Common weak patterns ───────────────────────────────────── */

const COMMON_PATTERNS = [
  "123456",
  "123",
  "1234",
  "12345",
  "password",
  "qwerty",
  "abc123",
  "letmein",
  "admin",
  "welcome",
  "monkey",
  "dragon",
  "master",
  "login",
  "azerty",
  "111111",
  "000000",
  "aaaaaa",
  "iloveyou",
  "trustno1",
  "sunshine",
  "princess",
  "football",
  "shadow",
  "superman",
  "michael",
  "654321",
  "passw0rd",
] as const;

/* ── Character-set size ─────────────────────────────────────── */

/**
 * Determine the size of the character pool used in the password.
 * Considers lowercase, uppercase, digits, and symbols independently.
 */
export function calculateCharsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 33; // common printable symbols
  return size || 1; // avoid log(0)
}

/* ── Entropy ────────────────────────────────────────────────── */

/**
 * Shannon-style entropy: `length × log2(charsetSize)`.
 * Penalised if common patterns or excessive repetition are found.
 */
export function calculateEntropy(password: string): number {
  const charset = calculateCharsetSize(password);
  let entropy = password.length * Math.log2(charset);

  // Penalise common patterns
  if (detectCommonPatterns(password)) {
    entropy *= 0.3; // heavy penalty
  }

  // Penalise repeated characters (e.g. "aaaaaa")
  const unique = new Set(password.split("")).size;
  const ratio = unique / password.length;
  if (ratio < 0.5) {
    entropy *= ratio + 0.2;
  }

  return Math.round(entropy * 100) / 100; // 2 decimal places
}

/* ── Brute-force time estimate ──────────────────────────────── */

/**
 * Estimate brute-force duration at 10^10 guesses / second.
 * Returns a human-readable string.
 */
export function estimateBruteForceTime(entropyBits: number): string {
  const guessesPerSecond = 1e10;
  const totalCombinations = Math.pow(2, entropyBits);
  // Average case = half the search space
  const seconds = totalCombinations / (2 * guessesPerSecond);

  if (seconds < 0.001) return "instant";
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} milliseconds`;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)} minutes`;

  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} hours`;

  const days = hours / 24;
  if (days < 365) return `${days.toFixed(1)} days`;

  const years = days / 365.25;
  if (years < 1e3) return `${years.toFixed(1)} years`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} thousand years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;

  return `${(years / 1e12).toFixed(1)} trillion years`;
}

/* ── Common-pattern detection ───────────────────────────────── */

/**
 * Returns true if the password contains a well-known weak pattern
 * or sequential / repeated runs.
 */
export function detectCommonPatterns(password: string): boolean {
  const lower = password.toLowerCase();

  // Check against known weak patterns
  if (COMMON_PATTERNS.some((p) => lower.includes(p))) return true;

  // Detect 3+ identical consecutive characters (e.g. "aaa")
  if (/(.)\1{2,}/.test(password)) return true;

  // Detect sequential runs of 4+ (abc, 1234, etc.)
  for (let i = 0; i <= lower.length - 4; i++) {
    const codes = [
      lower.charCodeAt(i),
      lower.charCodeAt(i + 1),
      lower.charCodeAt(i + 2),
      lower.charCodeAt(i + 3),
    ];
    const ascending =
      codes[1] - codes[0] === 1 &&
      codes[2] - codes[1] === 1 &&
      codes[3] - codes[2] === 1;
    const descending =
      codes[0] - codes[1] === 1 &&
      codes[1] - codes[2] === 1 &&
      codes[2] - codes[3] === 1;
    if (ascending || descending) return true;
  }

  return false;
}

/* ── Preliminary score (0–100) ──────────────────────────────── */

/**
 * Quick local score before Groq refinement.
 * Based on entropy, length, charset diversity, and pattern detection.
 */
export function calculatePreliminaryScore(password: string): number {
  const entropy = calculateEntropy(password);
  const charset = calculateCharsetSize(password);
  const hasPatterns = detectCommonPatterns(password);

  // Base score from entropy (0–60 range)
  let score = Math.min(60, entropy * 0.8);

  // Bonus for length (up to 15)
  score += Math.min(15, password.length * 1.2);

  // Bonus for charset diversity (up to 15)
  const charsetCategories =
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);
  score += charsetCategories * 3.75;

  // Penalise weak patterns
  if (hasPatterns) score *= 0.4;

  // Penalise tiny charset
  if (charset <= 10) score *= 0.6;

  return Math.round(Math.min(100, Math.max(0, score)));
}
