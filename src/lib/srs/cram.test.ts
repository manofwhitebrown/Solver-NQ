import { describe, expect, it } from 'vitest';
import type { Flashcard } from '../../types';
import { CRAM_DAYS, startSession } from './session';

const DAY = 86_400_000, now = 1_000_000_000_000;
const card = (id: string, dueInDays: number): Flashcard =>
  ({ id, front: id, back: id, subject: 'math', due: now + dueInDays * DAY, interval: 1, ease: 2.5, reps: 1, lapses: 0 });

describe('cram mode', () => {
  const cards = [card('due', -1), card('soon', 2), card('later', 10)];
  it('normal session has only due cards', () => { expect(startSession(cards, now).queue.map((c) => c.id)).toEqual(['due']); });
  it('cram also includes cards due within 3 days, most overdue first', () => {
    expect(startSession(cards, now, 50, CRAM_DAYS).queue.map((c) => c.id)).toEqual(['due', 'soon']);
  });
});
