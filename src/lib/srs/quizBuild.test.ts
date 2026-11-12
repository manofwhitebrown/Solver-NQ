import { describe, it, expect } from 'vitest';
import type { Answer, Question } from '@/types';
import type { QuizItem } from '@/types';
import { buildLocalQuiz, isCorrectChoice, sanitizeQuizItems } from './quizBuild';

const mk = (i: number, ans = `ans${i}`) => ({
  q: { id: `q${i}`, text: `Q${i}`, subject: 'math', tags: [], starred: false, createdAt: 0 } as Question,
  a: { id: `a${i}`, questionId: `q${i}`, mode: 'learn', finalAnswer: ans, steps: [], verified: 'unchecked', model: 'm', createdAt: 0 } as Answer,
});
let seed = 1;
const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('buildLocalQuiz', () => {
  it('makes multiple choice with the answer among 4 options when enough answers exist', () => {
    const items = buildLocalQuiz([1, 2, 3, 4, 5].map((i) => mk(i)), 5, rng);
    expect(items).toHaveLength(5);
    for (const it of items) {
      expect(it.options).toHaveLength(4);
      expect(it.options).toContain(it.answer);
      expect(new Set(it.options).size).toBe(4);
    }
  });
  it('falls back to short answer with too few distinct answers', () => {
    const items = buildLocalQuiz([mk(1), mk(2)], 5, rng);
    expect(items).toHaveLength(2);
    expect(items.every((i) => !i.options)).toBe(true);
  });
  it('skips questions without answers and respects count', () => {
    const e = [mk(1), { q: mk(2).q }, mk(3)];
    expect(buildLocalQuiz(e, 1, rng)).toHaveLength(1);
    expect(buildLocalQuiz(e, 10, rng)).toHaveLength(2);
  });
  it('compares choices ignoring case and spacing', () => expect(isCorrectChoice(' X  = 2', 'x = 2')).toBe(true));
});

describe('sanitizeQuizItems', () => {
  const item = (o: Partial<QuizItem>): QuizItem => ({ id: 'i', questionId: 'q', prompt: 'P', answer: 'A', ...o });
  it('keeps valid multiple choice', () => {
    const out = sanitizeQuizItems([item({ options: ['A', 'B', 'C', 'D'] })]);
    expect(out[0].options).toEqual(['A', 'B', 'C', 'D']);
  });
  it('turns impossible or tiny option lists into short answer', () => {
    const out = sanitizeQuizItems([item({ options: ['B', 'C', 'D', 'E'] }), item({ options: ['A'] }), item({ options: ['A', 'a'] })]);
    expect(out.map((x) => x.options)).toEqual([undefined, undefined, undefined]);
  });
  it('drops items without a prompt or answer', () => {
    expect(sanitizeQuizItems([item({ prompt: ' ' }), item({ answer: '' }), item({})])).toHaveLength(1);
  });
});
