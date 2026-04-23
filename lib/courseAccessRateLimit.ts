/**
 * Simple in-memory rate limiter (per server instance). Good enough for single-region deploys.
 */

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function prune(key: string, now: number) {
  const arr = hits.get(key) ?? [];
  const fresh = arr.filter((t) => now - t < WINDOW_MS);
  hits.set(key, fresh);
  return fresh;
}

export function isCourseAccessRateLimited(key: string): boolean {
  const now = Date.now();
  const arr = prune(key, now);
  if (arr.length >= MAX_PER_WINDOW) return true;
  arr.push(now);
  hits.set(key, arr);
  return false;
}
