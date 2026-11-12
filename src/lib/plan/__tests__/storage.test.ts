import { describe, expect, it } from 'vitest';
import { createPlanStore, normalizeState, pruneDone } from '../storage';
import { DEFAULT_STATE } from '../types';

describe('normalizeState', () => {
  it('gives defaults for junk', () => {
    expect(normalizeState(null)).toEqual(DEFAULT_STATE);
    expect(normalizeState('x')).toEqual(DEFAULT_STATE);
  });
  it('drops bad exams and clamps minutes', () => {
    const s = normalizeState({ minutesPerDay: 5000, offWeekdays: [0, 9, 'x'], weakSubjects: ['math', 'art'],
      exams: [{ id: 'a', subject: 'math', name: 'Ok', date: '2026-12-01' }, { id: 'b', subject: 'art', date: '2026-12-01' }, { id: 'c', subject: 'math', date: 'soon' }] });
    expect(s.exams).toHaveLength(1);
    expect(s.minutesPerDay).toBe(480);
    expect(s.offWeekdays).toEqual([0]);
    expect(s.weakSubjects).toEqual(['math']);
  });
  it('upgrades the older single-exam demo shape', () => {
    const s = normalizeState({ exam: 'Physics mock exam', date: new Date(2026, 10, 26, 12).getTime(), subjects: ['physics', 'math'], minutesPerDay: 45 });
    expect(s.exams).toEqual([{ id: 'legacy', subject: 'physics', name: 'Physics mock exam', date: '2026-11-26' }]);
    expect(s.minutesPerDay).toBe(45);
  });
});

describe('store', () => {
  it('round-trips through the backend', async () => {
    const mem = new Map<string, unknown>();
    const store = createPlanStore({ get: async (k) => mem.get(k), set: async (k, v) => { mem.set(k, v); } });
    expect(await store.load()).toEqual(DEFAULT_STATE);
    await store.save({ ...DEFAULT_STATE, minutesPerDay: 90, done: ['2026-11-12:quiz:math:1'] });
    expect((await store.load()).minutesPerDay).toBe(90);
  });
});

describe('pruneDone', () => {
  it('forgets ticks older than 14 days', () => {
    expect(pruneDone(['2026-10-01:quiz:math:1', '2026-11-10:quiz:math:1'], '2026-11-12')).toEqual(['2026-11-10:quiz:math:1']);
  });
});
