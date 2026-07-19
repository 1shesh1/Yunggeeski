/**
 * Simple in-memory sliding-window rate limiter (per server instance).
 * Good enough for single-region deploys. Mirrors courseAccessRateLimit but is
 * generic so multiple routes can share it with distinct keys/limits.
 */

const hits = new Map<string, number[]>();

export function isRateLimited(
  key: string,
  { max = 5, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
): boolean {
  const now = Date.now();
  const fresh = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (fresh.length >= max) {
    hits.set(key, fresh);
    return true;
  }
  fresh.push(now);
  hits.set(key, fresh);
  return false;
}
