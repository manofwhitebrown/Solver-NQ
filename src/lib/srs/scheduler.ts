import type { Flashcard } from '../../types';

export type Grade = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy

export const DAY_MS = 86_400_000;
export const MIN_EASE = 1.3;
export const START_EASE = 2.5;
const AGAIN_DELAY_MS = 10 * 60_000;

/** A brand-new card, due immediately. */
export function newCardFields(now = Date.now()): Pick<Flashcard, 'due' | 'interval' | 'ease' | 'reps' | 'lapses'> {
  return { due: now, interval: 0, ease: START_EASE, reps: 0, lapses: 0 };
}

const clampEase = (e: number) => Math.max(MIN_EASE, Math.round(e * 100) / 100);

/**
 * SM-2 style scheduler. `interval` is in days, `due` is a timestamp (ms).
 * Pure: returns a new card, never mutates the input.
 */
export function nextReview(card: Flashcard, grade: Grade, now = Date.now()): Flashcard {
  let { interval, ease, reps, lapses } = card;

  if (grade === 0) {
    // Lapse: relearn soon, keep a memory of the old interval via a lower ease.
    lapses += 1;
    reps = 0;
    interval = 0;
    ease = clampEase(ease - 0.2);
    return { ...card, interval, ease, reps, lapses, due: now + AGAIN_DELAY_MS };
  }

  const prev = interval;
  if (grade === 1) {
    ease = clampEase(ease - 0.15);
    interval = reps === 0 ? 1 : Math.max(prev + 1, Math.round(prev * 1.2));
  } else if (grade === 2) {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(prev + 1, Math.round(prev * ease));
  } else {
    ease = clampEase(ease + 0.15);
    interval = reps === 0 ? 4 : Math.max(prev + 2, Math.round(prev * ease * 1.3));
  }
  reps += 1;
  return { ...card, interval, ease, reps, lapses, due: now + interval * DAY_MS };
}

/** Preview the next interval (days) for each grade, for button labels. */
export function previewIntervals(card: Flashcard, now = Date.now()): [number, number, number, number] {
  const g = (x: Grade) => nextReview(card, x, now).interval;
  return [g(0), g(1), g(2), g(3)];
}

export const isDue = (card: Flashcard, now = Date.now()) => card.due <= now;
