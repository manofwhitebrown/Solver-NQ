// Client-side token bucket so rapid taps cannot burn the per-minute limit,
// plus de-duplication of identical in-flight requests.
let tokens = -1;
let last = 0;

export async function acquire(perMinute: number, now: () => number = Date.now, sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))): Promise<void> {
  const cap = Math.max(1, perMinute);
  const t = now();
  if (tokens < 0) { tokens = cap; last = t; }
  tokens = Math.min(cap, tokens + ((t - last) / 60_000) * cap);
  last = t;
  if (tokens >= 1) { tokens -= 1; return; }
  const wait = Math.ceil(((1 - tokens) / cap) * 60_000);
  await sleep(Math.min(wait, 20_000));
  tokens = 0; last = now();
}
export const resetThrottle = () => { tokens = -1; };

const inflight = new Map<string, Promise<unknown>>();
export function dedupe<T>(key: string, run: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key) as Promise<T> | undefined;
  if (hit) return hit;
  const p = run().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
