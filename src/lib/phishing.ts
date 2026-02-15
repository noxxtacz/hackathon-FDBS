/* ------------------------------------------------------------------
   Heuristic phishing-URL analyser (no external API required)
   ------------------------------------------------------------------ */

import type { RiskLabel } from "./types";
import { clamp } from "./validators";

/* ── URL helpers ────────────────────────────────────────────────── */

/** Normalise a raw user-submitted URL so we can parse it reliably. */
export function normalizeUrl(raw: string): string {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url;
}

/** Defang a URL for safe display (e.g. https[://]example[.]com). */
export function defangUrl(url: string): string {
  return url
    .replace(/\:\/\//g, "[://]")
    .replace(/\./g, "[.]");
}

/** Remove query-string / fragment that might contain PII. */
export function stripPII(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return url;
  }
}

/* ── Keyword lists ──────────────────────────────────────────────── */

const PHISHING_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "secure",
  "account",
  "update",
  "confirm",
  "banking",
  "password",
  "wallet",
  "paypal",
  "apple",
  "microsoft",
  "amazon",
  "netflix",
  "facebook",
  "instagram",
  "support",
  "helpdesk",
  "gift",
  "free",
  "winner",
  "prize",
  "urgent",
  "suspended",
  "blocked",
] as const;

const SUSPICIOUS_TLDS = [
  ".xyz",
  ".top",
  ".buzz",
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  ".gq",
  ".work",
  ".click",
  ".link",
  ".info",
  ".icu",
  ".cam",
  ".rest",
] as const;

/* ── Scoring engine ─────────────────────────────────────────────── */

export interface AnalysisResult {
  url: string;
  defanged_url: string;
  score: number;
  label: RiskLabel;
  reasons: string[];
  advice: string;
}

/**
 * Score a URL between 0 (safe) and 100 (dangerous) using heuristic
 * signals.  Returns structured analysis with reasons & advice.
 */
export function analyzeUrl(rawUrl: string): AnalysisResult {
  const url = normalizeUrl(rawUrl);
  let score = 0;
  const reasons: string[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      url,
      defanged_url: defangUrl(url),
      score: 100,
      label: "dangerous",
      reasons: ["URL could not be parsed – likely malformed"],
      advice:
        "Do not visit this link. It is not a valid URL and may be an attempt to exploit your browser.",
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullUrl = parsed.href.toLowerCase();

  // 1. Extremely long URL
  if (fullUrl.length > 80) {
    score += 20;
    reasons.push("URL is unusually long (>80 characters)");
  }

  // 2. IP-based hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    score += 25;
    reasons.push("Hostname is an IP address instead of a domain name");
  }

  // 3. Too many subdomains
  const subdomainCount = hostname.split(".").length - 2;
  if (subdomainCount > 3) {
    score += 15;
    reasons.push(`Excessive subdomains (${subdomainCount})`);
  }

  // 4. @ sign or suspicious percent-encoding
  if (parsed.href.includes("@") || /%[0-9a-f]{2}/i.test(parsed.href)) {
    score += 20;
    reasons.push("Contains '@' symbol or suspicious encoding");
  }

  // 5. Punycode / IDN homograph
  if (hostname.startsWith("xn--")) {
    score += 20;
    reasons.push("Uses Punycode (internationalised domain) – possible homograph attack");
  }

  // 6. Not HTTPS
  if (parsed.protocol !== "https:") {
    score += 10;
    reasons.push("Connection is not HTTPS");
  }

  // 7. Phishing keywords in hostname or path
  const matchedKeywords = PHISHING_KEYWORDS.filter(
    (kw) => hostname.includes(kw) || parsed.pathname.toLowerCase().includes(kw)
  );
  if (matchedKeywords.length >= 3) {
    score += 30;
    reasons.push(`Multiple phishing keywords found: ${matchedKeywords.join(", ")}`);
  } else if (matchedKeywords.length >= 1) {
    score += 10;
    reasons.push(`Phishing keyword(s): ${matchedKeywords.join(", ")}`);
  }

  // 8. Suspicious TLD
  const tldMatch = SUSPICIOUS_TLDS.find((tld) => hostname.endsWith(tld));
  if (tldMatch) {
    score += 15;
    reasons.push(`Suspicious top-level domain: ${tldMatch}`);
  }

  // 9. Hyphen-heavy domains (e.g. g00gle-login-secure.com)
  if ((hostname.match(/-/g) || []).length >= 3) {
    score += 10;
    reasons.push("Domain contains many hyphens – common in phishing");
  }

  // Cap at 100
  score = clamp(score, 0, 100);

  // Label
  const label: RiskLabel =
    score >= 70 ? "dangerous" : score >= 40 ? "suspicious" : "safe";

  // Build advice string
  let advice: string;
  if (label === "dangerous") {
    advice =
      "🚨 Do NOT visit this link. It shows strong indicators of phishing or malware distribution.";
  } else if (label === "suspicious") {
    advice =
      "⚠️ Proceed with extreme caution. Verify the sender and check the domain independently before clicking.";
  } else {
    advice =
      "✅ No obvious phishing signals detected, but always verify the source before entering personal data.";
  }

  return {
    url: stripPII(url),
    defanged_url: defangUrl(stripPII(url)),
    score,
    label,
    reasons: reasons.length > 0 ? reasons : ["No suspicious signals detected"],
    advice,
  };
}
