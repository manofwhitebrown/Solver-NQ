import { describe, it, expect } from 'vitest';
import type { Flashcard } from '../../types';
import { nextReview, newCardFields, DAY_MS, MIN_EASE, previewIntervals } from './scheduler';

const NOW = 1_700_000_000_000;
const card = (over: Partial<Flashcard> = {}): Flashcard => ({
  id: 'c1', front: 'f', back: 'b', subject: 'math', ...newCardFields(NOW), ...over,
});

describe('nextReview', () => {
  it('Good grows 1 -> 3 -> longer', () => {
    let c = nextReview(card(), 2, NOW);
    expect(c.interval).toBe(1);
    c = nextReview(c, 2, NOW);
    expect(c.interval).toBe(3);
    c = nextReview(c, 2, NOW);
    expect(c.interval).toBe(Math.round(3 * 2.5));
    expect(c.due).toBe(NOW + c.interval * DAY_MS);
  });
  it('Again resets reps, adds a lapse, lowers ease, due in minutes', () => {
    const c = nextReview(card({ reps: 5, interval: 20, ease: 2.5 }), 0, NOW);
    expect(c).toMatchObject({ reps: 0, lapses: 1, interval: 0, ease: 2.3 });
    expect(c.due - NOW).toBeLessThan(DAY_MS);
  });
  it('ease never drops below 1.3', () => {
    let c = card({ ease: 1.35 });
    for (let i = 0; i < 10; i++) c = nextReview(c, i % 2 ? 0 : 1, NOW);
    expect(c.ease).toBe(MIN_EASE);
  });
  it('Easy > Good > Hard intervals for a mature card', () => {
    const base = card({ reps: 4, interval: 10, ease: 2.5 });
    const [, h, g, e] = previewIntervals(base, NOW);
    expect(h).toBeLessThan(g);
    expect(g).toBeLessThan(e);
  });
  it('intervals always grow on pass grades', () => {
    const c = card({ reps: 3, interval: 1, ease: 1.3 });
    expect(nextReview(c, 1, NOW).interval).toBeGreaterThan(1);
  });
  it('does not mutate input', () => {
    const c = card(); const copy = { ...c };
    nextReview(c, 3, NOW);
    expect(c).toEqual(copy);
  });
});
