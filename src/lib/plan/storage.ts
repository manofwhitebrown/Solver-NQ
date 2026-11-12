import type { Subject } from '@/types';
import { addDays, dayKey, isDayKey } from './dates';
import { DEFAULT_STATE, type Exam, type PlanState } from './types';

export const PLAN_KEY = 'study-plan';
const SUBJECTS: Subject[] = ['math', 'physics', 'chemistry', 'biology', 'coding'];
const isSubject = (s: unknown): s is Subject => SUBJECTS.includes(s as Subject);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/** Accepts anything from storage (also the older single-exam demo shape) and returns a safe state. */
export function normalizeState(raw: unknown): PlanState {
  if (!isObj(raw)) return { ...DEFAULT_STATE };
  let exams: Exam[] = [];
  if (Array.isArray(raw.exams)) {
    exams = raw.exams.filter(isObj)
      .filter((e) => isSubject(e.subject) && isDayKey(e.date) && typeof e.id === 'string')
      .map((e) => ({ id: String(e.id), subject: e.subject as Subject, name: String(e.name ?? '').slice(0, 80), date: String(e.date) }));
  } else if (typeof raw.exam === 'string' && typeof raw.date === 'number' && Array.isArray(raw.subjects)) {
    const subject = raw.subjects.find(isSubject); // legacy: { exam, date(ms), subjects[], minutesPerDay }
    if (subject) exams = [{ id: 'legacy', subject, name: raw.exam.slice(0, 80), date: dayKey(raw.date) }];
  }
  const mins = Number(raw.minutesPerDay);
  return {
    exams,
    minutesPerDay: Number.isFinite(mins) ? Math.min(480, Math.max(15, Math.round(mins))) : DEFAULT_STATE.minutesPerDay,
    offWeekdays: Array.isArray(raw.offWeekdays) ? raw.offWeekdays.filter((n): n is number => Number.isInteger(n) && n >= 0 && n <= 6) : [],
    weakSubjects: Array.isArray(raw.weakSubjects) ? raw.weakSubjects.filter(isSubject) : [],
    done: Array.isArray(raw.done) ? raw.done.filter((s): s is string => typeof s === 'string').slice(-400) : [],
  };
}

export interface Kv { get(key: string): Promise<unknown>; set(key: string, value: unknown): Promise<void> }

/** One interface so tests (and any future storage) can swap the backend. */
export function createPlanStore(kv: Kv) {
  return {
    load: async (): Promise<PlanState> => normalizeState(await kv.get(PLAN_KEY).catch(() => undefined)),
    save: (s: PlanState) => kv.set(PLAN_KEY, s),
  };
}

/** Drops ticks older than 14 days so the list never grows without limit. */
export function pruneDone(done: string[], today: string): string[] {
  const cut = addDays(today, -14);
  return done.filter((id) => id.slice(0, 10) >= cut);
}
