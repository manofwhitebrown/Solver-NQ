import { dayKey, daysBetween, type DayKey } from './day';

export interface DayStat { reviews: number; correct: number } // correct = grade >= Good-ish (1..3)
export interface Progress { goal: number; days: Record<DayKey, DayStat> }

export const DEFAULT_GOAL = 20;
export const emptyProgress = (): Progress => ({ goal: DEFAULT_GOAL, days: {} });

export function recordReview(p: Progress, grade: 0 | 1 | 2 | 3, ts = Date.now()): Progress {
  const k = dayKey(ts);
  const cur = p.days[k] ?? { reviews: 0, correct: 0 };
  return {
    ...p,
    days: { ...p.days, [k]: { reviews: cur.reviews + 1, correct: cur.correct + (grade > 0 ? 1 : 0) } },
  };
}

/** Consecutive days with >=1 review, ending today (or yesterday, so the streak isn't lost before you study today). */
export function currentStreak(p: Progress, ts = Date.now()): number {
  const today = dayKey(ts);
  const active = Object.keys(p.days).filter((k) => p.days[k].reviews > 0).sort();
  if (!active.length) return 0;
  const last = active[active.length - 1];
  if (daysBetween(last, today) > 1) return 0;
  let streak = 1;
  for (let i = active.length - 1; i > 0; i--) {
    if (daysBetween(active[i - 1], active[i]) === 1) streak++;
    else break;
  }
  return streak;
}

export function goalProgress(p: Progress, ts = Date.now()): { done: number; goal: number; ratio: number } {
  const done = p.days[dayKey(ts)]?.reviews ?? 0;
  return { done, goal: p.goal, ratio: Math.min(1, p.goal ? done / p.goal : 0) };
}

/** Last `n` days (oldest first) for the reviews-per-day chart. */
export function lastDays(p: Progress, n: number, ts = Date.now()): Array<{ day: DayKey } & DayStat> {
  const out: Array<{ day: DayKey } & DayStat> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ts);
    d.setDate(d.getDate() - i);
    const k = dayKey(d.getTime());
    out.push({ day: k, ...(p.days[k] ?? { reviews: 0, correct: 0 }) });
  }
  return out;
}

export function accuracy(p: Progress): number {
  let r = 0, c = 0;
  for (const s of Object.values(p.days)) { r += s.reviews; c += s.correct; }
  return r ? c / r : 0;
}

const KEY = 'solvernq.srs.progress';
export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch { return emptyProgress(); }
}
export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage full or blocked: ignore */ }
}
