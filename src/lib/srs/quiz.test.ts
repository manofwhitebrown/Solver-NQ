import { describe, it, expect } from 'vitest';
import { score, weakTopics, wrongIds, remainingSeconds } from './quizScore';
import { startSession, answerCurrent, summary } from './session';
import { newCardFields } from './scheduler';
import type { Flashcard, Subject } from '../../types';

const r = (id: string, subject: Subject, tags: string[], correct: boolean) => ({ questionId: id, subject, tags, correct });

describe('quiz scoring', () => {
  const res = [r('1', 'math', ['algebra'], true), r('2', 'math', ['algebra'], false), r('3', 'physics', [], false)];
  it('scores', () => expect(score(res)).toEqual({ total: 3, correct: 1, percent: 33 }));
  it('lists weakest topics first', () => {
    const w = weakTopics(res);
    expect(w[0].accuracy).toBe(0);
    expect(w.find((t) => t.topic === '#algebra')?.accuracy).toBe(0.5);
  });
  it('wrong ids unique', () => expect(wrongIds(res)).toEqual(['2', '3']));
  it('timer never negative', () => expect(remainingSeconds(0, 60, 120_000)).toBe(0));
});

describe('review session', () => {
  const mk = (id: string, due: number): Flashcard => ({ id, front: id, back: id, subject: 'other', ...newCardFields(0), due });
  it('queues only due cards, most overdue first', () => {
    const s = startSession([mk('b', 50), mk('a', 10), mk('later', 999)], 100);
    expect(s.queue.map((c) => c.id)).toEqual(['a', 'b']);
  });
  it('Again re-queues, Good removes', () => {
    let s = startSession([mk('a', 1), mk('b', 2)], 100);
    s = answerCurrent(s, 0, 100).session;
    expect(s.queue.map((c) => c.id)).toEqual(['b', 'a']);
    s = answerCurrent(s, 2, 100).session;
    s = answerCurrent(s, 2, 100).session;
    expect(s.queue).toHaveLength(0);
    expect(summary(s)).toMatchObject({ reviewed: 3, again: 1, good: 2 });
  });
});
