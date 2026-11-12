import type { Failure } from './types';

const PACIFIC = 'America/Los_Angeles';

/** Epoch ms of the next midnight in Pacific time (Gemini daily quotas reset then). */
export function nextPacificMidnight(now: number): number {
  const parts = (t: number) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: PACIFIC, hourCycle: 'h23', hour: 'numeric', minute: 'numeric', second: 'numeric',
    }).formatToParts(new Date(t)).map(x => [x.type, x.value]));
    return (Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second)) * 1000;
  };
  return now + (86_400_000 - parts(now)) + 1000;
}

/** "retryDelay": "33s" or "retry in 33.5s" -> ms. */
export function parseRetryDelay(body: string): number | undefined {
  const m = /"retryDelay"\s*:\s*"([\d.]+)s"/.exec(body) ?? /retry in ([\d.]+)\s*s/i.exec(body);
  return m ? Math.ceil(Number(m[1]) * 1000) : undefined;
}

/** Decide what a failed HTTP call means. `body` is only inspected, never stored or logged. */
export function classify(status: number, body: string): Failure {
  const b = body.toLowerCase();
  if (/limit:\s*0/.test(b)) return { kind: 'unavailable' };
  if (/blockreason|prohibited_content|blocked.*safety|safety/.test(b) && status === 400) return { kind: 'safety' };
  if (status === 429 || b.includes('resource_exhausted') || b.includes('quota')) {
    const daily = /per.?day|daily|perday/.test(b);
    return { kind: 'quota', daily, retryAfterMs: parseRetryDelay(body) };
  }
  if (status === 404 || /not found|deprecated|no longer (available|supported)/.test(b)) return { kind: 'unavailable' };
  if (status === 401 || status === 403 || /api key not valid|api_key_invalid|permission_denied/.test(b)) return { kind: 'badkey' };
  if (status === 400) return { kind: 'badrequest' };
  if (status === 408 || status === 500 || status === 502 || status === 503 || status === 504 || b.includes('overloaded')) {
    return { kind: 'transient' };
  }
  return { kind: 'transient' };
}

/** How long to cool a slot after a quota failure. */
export function cooldownUntil(f: Failure, now: number): number {
  if (f.daily) return nextPacificMidnight(now);
  return now + (f.retryAfterMs ?? 60_000);
}
