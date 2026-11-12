import { describe, expect, it } from 'vitest';
import { buildPlan, examWeight, isWeak, progressOf } from '../planner';
import { addDays, weekday } from '../dates';
import { DEFAULT_STATE, type PlanSettings, type StatsMap } from '../types';

const today = '2026-11-12'; // Thursday
const base: PlanSettings = { ...DEFAULT_STATE, minutesPerDay: 60,
  exams: [{ id: 'e1', subject: 'math', name: 'Midterm', date: '2026-11-20' }] };

describe('dates', () => {
  it('adds days across month ends and knows weekdays', () => {
    expect(addDays('2026-11-30', 2)).toBe('2026-12-02');
    expect(weekday(today)).toBe(4);
  });
});

describe('buildPlan', () => {
  it('is empty with no upcoming exams', () => {
    expect(buildPlan(DEFAULT_STATE, {}, today)).toEqual([]);
    expect(buildPlan({ ...base, exams: [{ ...base.exams[0], date: '2026-11-01' }] }, {}, today)).toEqual([]);
  });
  it('covers every day from today to the exam; exam day has no tasks, eve is a light rest day', () => {
    const p = buildPlan(base, {}, today);
    expect(p).toHaveLength(9);
    expect(p[0].day).toBe(today);
    expect(p[8].tasks).toHaveLength(0);
    expect(p[8].exams).toHaveLength(1);
    expect(p[7].restDay).toBe(true);
    expect(p[7].tasks.some((t) => t.kind === 'rest')).toBe(true);
    expect(p[7].minutes).toBeLessThanOrEqual(20);
  });
  it('gives 2-4 tasks on a study day within the daily minutes', () => {
    for (const mins of [20, 45, 60, 120]) {
      const p = buildPlan({ ...base, minutesPerDay: mins }, {}, today);
      for (const d of p.filter((x) => !x.restDay && x.tasks.length)) {
        expect(d.tasks.length).toBeGreaterThanOrEqual(2);
        expect(d.tasks.length).toBeLessThanOrEqual(4);
        expect(d.minutes).toBeLessThanOrEqual(Math.max(mins, 10));
      }
    }
  });
  it('skips off weekdays', () => {
    const p = buildPlan({ ...base, offWeekdays: [0, 6] }, {}, today);
    for (const d of p) if ([0, 6].includes(weekday(d.day))) expect(d.tasks).toHaveLength(0);
  });
  it('deep-links tasks and uses unique ids', () => {
    const stats: StatsMap = { math: { due: 12, lapseRate: 0, reviews: 0, saved: 3, notes: [{ id: 'n1', title: 'Limits' }] } };
    const tasks = buildPlan(base, stats, today).flatMap((d) => d.tasks);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
    const tos = tasks.map((t) => t.to);
    expect(tos).toContain('/learn/review');
    expect(tos.some((t) => t.startsWith('/learn/quiz?subject=math'))).toBe(true);
    expect(tos.some((t) => t.startsWith('/library?subject=math'))).toBe(true);
    expect(tos).toContain('/notes/n1');
    expect(buildPlan(base, stats, today)[0].tasks[0].title).toContain('12 due');
  });
  it('spends more time on the weak subject and the sooner exam', () => {
    const s: PlanSettings = { ...base, weakSubjects: ['physics'], exams: [
      { id: 'a', subject: 'math', name: 'M', date: '2026-11-25' },
      { id: 'b', subject: 'physics', name: 'P', date: '2026-11-25' },
    ] };
    const mins = { math: 0, physics: 0 } as Record<string, number>;
    for (const t of buildPlan(s, {}, today).flatMap((d) => d.tasks)) if (t.subject) mins[t.subject] += t.minutes;
    expect(mins.physics).toBeGreaterThan(mins.math);
    expect(examWeight(2, false)).toBeGreaterThan(examWeight(20, false));
  });
  it('treats low accuracy as weak only with enough reviews', () => {
    const st = (lapseRate: number, reviews: number): StatsMap => ({ math: { due: 0, lapseRate, reviews, saved: 0, notes: [] } });
    expect(isWeak('math', base, st(0.4, 10))).toBe(true);
    expect(isWeak('math', base, st(0.4, 2))).toBe(false);
    expect(isWeak('math', { ...base, weakSubjects: ['math'] }, {})).toBe(true);
  });
  it('re-plans after skipped days: later start still covers every remaining day', () => {
    const later = addDays(today, 3);
    const p = buildPlan(base, {}, later);
    expect(p[0].day).toBe(later);
    expect(p.at(-1)?.day).toBe('2026-11-20');
    expect(p.flatMap((d) => d.tasks).every((t) => t.day >= later)).toBe(true);
  });
  it('caps the horizon', () => {
    const p = buildPlan({ ...base, exams: [{ ...base.exams[0], date: '2027-12-31' }] }, {}, today);
    expect(p.length).toBeLessThanOrEqual(60);
  });
});

describe('progressOf', () => {
  it('ignores the rest task and counts ticked ones', () => {
    const p = buildPlan(base, {}, today);
    const eve = p[7];
    expect(progressOf(eve.tasks, []).total).toBe(1);
    const pr = progressOf(p[0].tasks, [p[0].tasks[0].id]);
    expect(pr.done).toBe(1);
    expect(pr.ratio).toBeGreaterThan(0);
  });
});
