// When everything is cooling down, wake up when the first slot is ready again and retry the queue.
let timer: ReturnType<typeof setTimeout> | undefined;

export function scheduleFlushAt(ts: number): void {
  if (typeof window === 'undefined') return;
  if (timer) clearTimeout(timer);
  const wait = Math.min(Math.max(ts - Date.now() + 1000, 1000), 2_147_000_000);
  timer = setTimeout(() => { void import('./pending').then(m => m.flushPending()); }, wait);
}
