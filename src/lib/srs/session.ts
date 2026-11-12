import type { Flashcard } from '../../types';
import { nextReview, type Grade } from './scheduler';

export interface Session {
  queue: Flashcard[];          // cards still to show (front = current)
  done: Array<{ card: Flashcard; grade: Grade }>;
  startedAt: number;
}

export const CRAM_DAYS = 3;

/** Build a review queue: due cards, most overdue first, capped. `aheadDays` > 0 is cram mode (also cards due soon). */
export function startSession(cards: Flashcard[], now = Date.now(), cap = 50, aheadDays = 0): Session {
  const limit = now + aheadDays * 86_400_000;
  const queue = cards.filter((c) => c.due <= limit).sort((a, b) => a.due - b.due).slice(0, cap);
  return { queue, done: [], startedAt: now };
}

/** Grade the current card. "Again" cards go back near the end of this session. */
export function answerCurrent(s: Session, grade: Grade, now = Date.now()): { session: Session; updated: Flashcard } {
  const [cur, ...rest] = s.queue;
  if (!cur) throw new Error('No card to grade');
  const updated = nextReview(cur, grade, now);
  const queue = grade === 0 ? [...rest.slice(0, 3), updated, ...rest.slice(3)] : rest;
  return { session: { ...s, queue, done: [...s.done, { card: updated, grade }] }, updated };
}

export function summary(s: Session) {
  const n = s.done.length;
  const count = (g: Grade) => s.done.filter((d) => d.grade === g).length;
  return { reviewed: n, again: count(0), hard: count(1), good: count(2), easy: count(3), accuracy: n ? (n - count(0)) / n : 0 };
}
