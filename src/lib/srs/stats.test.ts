import { describe, it, expect } from 'vitest';
import type { Flashcard } from '@/types';
import { emptyProgress, recordReview } from './progress';
import { accuracySeries, cardMaturity, retentionRate } from './stats';
import { newCardFields } from './scheduler';

const at = (d: number) => new Date(2026, 10, d, 12).getTime();

describe('stats', () => {
  it('retention and accuracy series ignore days with no reviews', () => {
    let p = emptyProgress();
    p = recordReview(recordReview(p, 2, at(10)), 0, at(10));
    p = recordReview(p, 3, at(12));
    expect(retentionRate(p, 30, at(12))).toBeCloseTo(2 / 3);
    const s = accuracySeries(p, 3, at(12));
    expect(s.map((x) => x.value)).toEqual([0.5, null, 1]);
  });
  it('retention is 0 with no reviews', () => expect(retentionRate(emptyProgress())).toBe(0));
  it('classifies card maturity', () => {
    const c = (o: Partial<Flashcard>): Flashcard => ({ id: 'x', front: 'f', back: 'b', subject: 'other', ...newCardFields(0), ...o });
    expect(cardMaturity([c({}), c({ reps: 2, interval: 6 }), c({ reps: 5, interval: 30 })])).toEqual({ new: 1, young: 1, mature: 1 });
  });
});
