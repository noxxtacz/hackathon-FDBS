/**
 * Lightweight typed fetch wrapper.
 * Throws on non-OK responses so callers can catch and display errors.
 */
export async function fetchJSON<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Request failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`
    );
  }

  return res.json() as Promise<T>;
}
