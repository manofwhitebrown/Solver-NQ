import { describe, it, expect } from 'vitest';
import { dayKey, daysBetween } from './day';
import { emptyProgress, recordReview, currentStreak, goalProgress } from './progress';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe('day', () => {
  it('uses local calendar date and handles month/DST gaps', () => {
    expect(dayKey(at(2026, 3, 8, 23))).toBe('2026-03-08');
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('streak and goal', () => {
  it('counts consecutive days and survives until end of tomorrow', () => {
    let p = emptyProgress();
    for (const d of [8, 9, 10]) p = recordReview(p, 2, at(2026, 11, d));
    expect(currentStreak(p, at(2026, 11, 10))).toBe(3);
    expect(currentStreak(p, at(2026, 11, 11))).toBe(3); // not studied yet today
    expect(currentStreak(p, at(2026, 11, 12))).toBe(0);
  });
  it('a gap breaks the streak', () => {
    let p = emptyProgress();
    for (const d of [5, 6, 9, 10]) p = recordReview(p, 3, at(2026, 11, d));
    expect(currentStreak(p, at(2026, 11, 10))).toBe(2);
  });
  it('tracks daily goal', () => {
    let p = { ...emptyProgress(), goal: 4 };
    p = recordReview(recordReview(p, 0, at(2026, 11, 10)), 2, at(2026, 11, 10));
    expect(goalProgress(p, at(2026, 11, 10))).toEqual({ done: 2, goal: 4, ratio: 0.5 });
  });
});
