/** Turns fetch/stream errors (which may wrap a JSON body) into a readable message. */
export function readableError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  try {
    const parsed = JSON.parse(raw) as { error?: string; message?: string };
    if (parsed.error || parsed.message) return String(parsed.error ?? parsed.message);
  } catch {
    /* not JSON */
  }
  const jsonInside = raw.match(/\{.*"error"\s*:\s*"([^"]+)".*\}/);
  if (jsonInside?.[1]) return jsonInside[1];
  if (/failed to fetch|network/i.test(raw)) return "Network error — check your connection and try again.";
  return raw || "Something went wrong. Please try again.";
}
