/* ------------------------------------------------------------------
   Phishing heuristic engine
   ------------------------------------------------------------------
   Pure functions — no I/O, no secret logging.
   ------------------------------------------------------------------ */

/* ── Types ──────────────────────────────────────────────────────── */

export interface HeuristicSignal {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
}

export interface HeuristicResult {
  riskScore: number;
  signals: HeuristicSignal[];
  normalizedUrl?: string;
  extractedUrls: string[];
}

/* ── URL normaliser ─────────────────────────────────────────────── */

/**
 * Prepend https:// if missing, validate with URL constructor.
 * Returns null if the string is not a usable URL.
 */
export function normalizeUrl(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    // reject non-http(s) schemes that slipped through
    if (!["http:", "https:"].includes(u.protocol)) return null;
    return u.href;
  } catch {
    return null;
  }
}

/* ── Extract URLs from arbitrary text ───────────────────────────── */

const URL_RE =
  /https?:\/\/[^\s<>"')\]]+|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|co|info|biz|xyz|me|app|dev|ly|tk|ml|ga|cf|gq|ru|cn|pw|top|cc|ws|link|click|site|online|store|tech|icu|work|fun|vip|club|buzz|live|world|one|pro|space|cfd)(?:\/[^\s<>"')\]]*)?/gi;

/**
 * Pull every URL-like string from free text, normalise, deduplicate.
 * Security: never log the extracted URLs (may contain tokens / PII).
 */
export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_RE) ?? [];
  const set = new Set<string>();
  for (const m of matches) {
    const n = normalizeUrl(m);
    if (n) set.add(n);
  }
  return [...set];
}

/* ── URL heuristic checks ───────────────────────────────────────── */

const SHORTENER_HOSTS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
  "is.gd", "buff.ly", "adf.ly", "lnk.to", "rb.gy",
  "cutt.ly", "shorturl.at", "tiny.cc",
]);

const SUSPICIOUS_URL_KEYWORDS = [
  "login", "signin", "sign-in", "verify", "secure",
  "account", "update", "confirm", "banking", "password",
  "wallet", "paypal", "webscr", "auth", "token",
  "suspend", "locked", "unusual", "recover",
];

export function analyzeUrlHeuristics(url: string): HeuristicSignal[] {
  const signals: HeuristicSignal[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    signals.push({ code: "INVALID_URL", severity: "high", message: "URL could not be parsed" });
    return signals;
  }

  const host = parsed.hostname.toLowerCase();

  // 1. IP-based URL
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) {
    signals.push({ code: "IP_URL", severity: "high", message: "URL uses a raw IP address instead of a domain" });
  }

  // 2. Punycode / IDN homograph
  if (host.includes("xn--")) {
    signals.push({ code: "PUNYCODE", severity: "high", message: "Domain uses internationalized (punycode) encoding — possible homograph attack" });
  }

  // 3. Excessive subdomains (>3 labels)
  if (host.split(".").length > 4) {
    signals.push({ code: "MANY_SUBDOMAINS", severity: "medium", message: "Domain has an unusually high number of subdomains" });
  }

  // 4. HTTP (no TLS)
  if (parsed.protocol === "http:") {
    signals.push({ code: "NO_TLS", severity: "medium", message: "URL uses unencrypted HTTP" });
  }

  // 5. Very long URL (> 200 chars)
  if (url.length > 200) {
    signals.push({ code: "LONG_URL", severity: "low", message: "URL is unusually long — may hide the real destination" });
  }

  // 6. Heavy percent-encoding
  const pctCount = (url.match(/%[0-9A-F]{2}/gi) ?? []).length;
  if (pctCount > 5) {
    signals.push({ code: "ENCODED_CHARS", severity: "medium", message: "URL contains many percent-encoded characters" });
  }

  // 7. Suspicious keywords in path / query
  const lower = url.toLowerCase();
  for (const kw of SUSPICIOUS_URL_KEYWORDS) {
    if (lower.includes(kw)) {
      signals.push({ code: `KW_${kw.toUpperCase()}`, severity: "medium", message: `URL contains suspicious keyword "${kw}"` });
      break; // one is enough to flag
    }
  }

  // 8. URL shortener
  if (SHORTENER_HOSTS.has(host)) {
    signals.push({ code: "SHORTENER", severity: "medium", message: "URL uses a known link shortener — real destination is hidden" });
  }

  // 9. @ sign in URL (credential smuggling)
  if (url.includes("@")) {
    signals.push({ code: "AT_SIGN", severity: "high", message: "URL contains an @ sign — may trick browsers into ignoring the real host" });
  }

  // 10. Suspicious TLDs
  const RISKY_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".pw", ".top", ".xyz", ".click", ".buzz"];
  if (RISKY_TLDS.some((t) => host.endsWith(t))) {
    signals.push({ code: "RISKY_TLD", severity: "medium", message: "Domain uses a TLD commonly associated with abuse" });
  }

  return signals;
}

/* ── Text-content heuristic checks ──────────────────────────────── */

const URGENCY_PHRASES = [
  "act now", "immediately", "urgent", "expire", "limited time",
  "within 24 hours", "within 48 hours", "suspend", "terminated",
  "locked", "unauthorized", "unusual activity", "verify your identity",
  "click here or else", "final warning", "last chance",
];

const CREDENTIAL_PHRASES = [
  "enter your password", "confirm your password", "enter your pin",
  "social security", "credit card number", "bank account",
  "one-time code", "otp", "verification code", "ssn",
  "date of birth", "mother's maiden name",
];

const PAYMENT_PHRASES = [
  "refund", "payment failed", "invoice attached", "wire transfer",
  "bitcoin", "cryptocurrency", "gift card", "itunes card",
  "send money", "outstanding balance",
];

export function analyzeTextHeuristics(text: string): HeuristicSignal[] {
  const signals: HeuristicSignal[] = [];
  const lower = text.toLowerCase();

  for (const p of URGENCY_PHRASES) {
    if (lower.includes(p)) {
      signals.push({ code: "URGENCY", severity: "high", message: `Text contains urgency language: "${p}"` });
      break;
    }
  }

  for (const p of CREDENTIAL_PHRASES) {
    if (lower.includes(p)) {
      signals.push({ code: "CREDENTIAL_REQ", severity: "high", message: `Text requests sensitive credentials: "${p}"` });
      break;
    }
  }

  for (const p of PAYMENT_PHRASES) {
    if (lower.includes(p)) {
      signals.push({ code: "PAYMENT_TRIGGER", severity: "medium", message: `Text contains payment / financial trigger: "${p}"` });
      break;
    }
  }

  // Generic social-engineering patterns
  if (/dear (customer|user|member|client|valued)/i.test(text)) {
    signals.push({ code: "GENERIC_GREETING", severity: "low", message: "Uses a generic greeting (common in phishing)" });
  }

  if (/click (here|the link|below)/i.test(text)) {
    signals.push({ code: "CLICK_BAIT", severity: "medium", message: "Encourages user to click a link" });
  }

  return signals;
}

/* ── Scoring ────────────────────────────────────────────────────── */

const SEVERITY_WEIGHT: Record<HeuristicSignal["severity"], number> = {
  low: 5,
  medium: 15,
  high: 25,
};

/**
 * Convert an array of signals into a 0-100 risk score.
 * Capped at 100.
 */
export function scoreFromSignals(signals: HeuristicSignal[]): number {
  const raw = signals.reduce((sum, s) => sum + SEVERITY_WEIGHT[s.severity], 0);
  return Math.min(100, raw);
}
