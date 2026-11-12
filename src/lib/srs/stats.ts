import type { Flashcard } from '@/types';
import { lastDays, type Progress } from './progress';

/** Share of reviews in the last `n` days that were not "Again". 0 when nothing was reviewed. */
export function retentionRate(p: Progress, n = 30, ts = Date.now()): number {
  let r = 0, c = 0;
  for (const d of lastDays(p, n, ts)) { r += d.reviews; c += d.correct; }
  return r ? c / r : 0;
}

/** Daily accuracy series; days with no reviews give null so the chart can leave a gap. */
export function accuracySeries(p: Progress, n = 14, ts = Date.now()): Array<{ day: string; value: number | null }> {
  return lastDays(p, n, ts).map((d) => ({ day: d.day, value: d.reviews ? d.correct / d.reviews : null }));
}

export const MATURE_DAYS = 21;

/** New = never reviewed, young = interval under 21 days, mature = 21+ days. */
export function cardMaturity(cards: Flashcard[]): { new: number; young: number; mature: number } {
  const out = { new: 0, young: 0, mature: 0 };
  for (const c of cards) {
    if (c.reps === 0 && c.lapses === 0 && c.interval === 0) out.new++;
    else if (c.interval >= MATURE_DAYS) out.mature++;
    else out.young++;
  }
  return out;
}
