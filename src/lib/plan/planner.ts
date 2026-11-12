import type { Subject } from '@/types';
import { addDays, daysBetween, weekday } from './dates';
import type { Exam, PlanDay, PlanSettings, StatsMap, Task, TaskKind } from './types';

export const MAX_HORIZON = 60;   // days we plan ahead
const WEAK_LAPSE_RATE = 0.25;
const WEAK_MIN_REVIEWS = 5;      // too few reviews = not enough evidence

export function isWeak(subject: Subject, s: Pick<PlanSettings, 'weakSubjects'>, stats: StatsMap): boolean {
  const st = stats[subject];
  return s.weakSubjects.includes(subject) || (!!st && st.reviews >= WEAK_MIN_REVIEWS && st.lapseRate >= WEAK_LAPSE_RATE);
}

/** Weak subjects count 1.6x; the closer the exam, the more it pulls. */
export const examWeight = (daysLeft: number, weak: boolean) => (weak ? 1.6 : 1) * (1 + 6 / Math.max(1, daysLeft));

const round5 = (n: number) => Math.max(5, Math.floor(n / 5) * 5);
const label = (s: Subject) => s.charAt(0).toUpperCase() + s.slice(1);

/** Share of the day for each subject that still has an exam ahead, biggest first. */
function shares(day: string, exams: Exam[], s: PlanSettings, stats: StatsMap): Array<[Subject, number]> {
  const w = new Map<Subject, number>();
  for (const e of exams) {
    const left = daysBetween(day, e.date);
    if (left <= 0) continue;
    w.set(e.subject, (w.get(e.subject) ?? 0) + examWeight(left, isWeak(e.subject, s, stats)));
  }
  const total = [...w.values()].reduce((a, b) => a + b, 0) || 1;
  return [...w.entries()].map(([k, v]): [Subject, number] => [k, v / total]).sort((a, b) => b[1] - a[1]);
}

function makeTask(day: string, j: number, kind: TaskKind, minutes: number, subject: Subject | undefined,
  title: string, to: string): Task {
  return { id: `${day}:${kind}:${subject ?? 'all'}:${j}`, day, kind, subject, minutes, title, to };
}

function subjectTask(day: string, j: number, dayIdx: number, subject: Subject, minutes: number, stats: StatsMap): Task {
  const st = stats[subject];
  const kinds: TaskKind[] = ['quiz'];
  if (st?.saved) kinds.push('saved');
  if (st?.notes.length) kinds.push('note');
  const kind = kinds[(dayIdx + j) % kinds.length];
  const q = `subject=${encodeURIComponent(subject)}`;
  if (kind === 'saved') return makeTask(day, j, kind, minutes, subject, `Revisit your saved ${label(subject)} questions`, `/library?${q}`);
  if (kind === 'note' && st?.notes.length) {
    const n = st.notes[(dayIdx + j) % st.notes.length];
    return makeTask(day, j, kind, minutes, subject, `Read your note: ${n.title}`, `/notes/${n.id}`);
  }
  return makeTask(day, j, 'quiz', minutes, subject, `${label(subject)} quiz`, `/learn/quiz?${q}`);
}

function dueTotal(subs: Array<[Subject, number]>, stats: StatsMap) {
  return subs.reduce((a, [s]) => a + (stats[s]?.due ?? 0), 0);
}

function studyDay(day: string, idx: number, budget: number, subs: Array<[Subject, number]>, stats: StatsMap): Task[] {
  const n = Math.min(4, Math.max(2, Math.round(budget / 20)));
  const per = Math.min(30, round5(budget / n));
  const out: Task[] = [];
  const due = dueTotal(subs, stats);
  if (due > 0 || idx % 2 === 0) {
    out.push(makeTask(day, 0, 'review', per, undefined,
      due > 0 ? `Review your flashcards (${due} due)` : 'Review your flashcards', '/learn/review'));
  }
  const slots = n - out.length;
  const order: Subject[] = [];
  for (const [s, share] of subs) for (let k = 0; k < Math.max(1, Math.round(slots * share)); k++) order.push(s);
  while (order.length < slots) order.push(subs[0][0]);
  order.slice(0, slots).forEach((s, k) => out.push(subjectTask(day, out.length + k, idx, s, per, stats)));
  return out;
}

/**
 * Plan from `today` to the last exam. Pure: same input, same plan. Because it always starts at `today`,
 * skipped days simply disappear and the remaining days absorb the work (that is the "re-plan").
 */
export function buildPlan(s: PlanSettings, stats: StatsMap, today: string): PlanDay[] {
  const exams = s.exams.filter((e) => e.date >= today);
  if (!exams.length) return [];
  const last = exams.reduce((a, e) => (e.date > a ? e.date : a), today);
  const span = Math.min(daysBetween(today, last), MAX_HORIZON - 1);
  const days: PlanDay[] = [];
  for (let i = 0; i <= span; i++) {
    const day = addDays(today, i);
    const examsToday = exams.filter((e) => e.date === day);
    const off = s.offWeekdays.includes(weekday(day));
    const eve = exams.some((e) => e.date === addDays(day, 1));
    const subs = shares(day, exams, s, stats);
    const base: PlanDay = { day, tasks: [], minutes: 0, off, restDay: false, exams: examsToday };
    if (examsToday.length || !subs.length) { days.push(base); continue; }
    if (eve) {
      const light = makeTask(day, 0, 'review', round5(s.minutesPerDay * 0.3), undefined, 'A light look at your flashcards', '/learn/review');
      const rest = makeTask(day, 1, 'rest', 0, undefined, 'Rest and sleep well. You have done the work.', '/plan');
      days.push({ ...base, restDay: true, tasks: [light, rest], minutes: light.minutes });
    } else if (!off) {
      const tasks = studyDay(day, i, s.minutesPerDay, subs, stats);
      days.push({ ...base, tasks, minutes: tasks.reduce((a, t) => a + t.minutes, 0) });
    } else days.push(base);
  }
  return days;
}

export interface Progress { done: number; total: number; ratio: number }
export function progressOf(tasks: Task[], done: string[]): Progress {
  const real = tasks.filter((t) => t.kind !== 'rest');
  const set = new Set(done);
  const d = real.filter((t) => set.has(t.id)).length;
  return { done: d, total: real.length, ratio: real.length ? d / real.length : 0 };
}

export const daysUntil = (exam: Exam, today: string) => daysBetween(today, exam.date);
