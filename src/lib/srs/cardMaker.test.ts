import { describe, it, expect } from 'vitest';
import type { Answer, Question } from '../../types';
import { buildLocalCards, dedupe } from './cardMaker';
import { exportCards, importCards } from './csv';

const q: Question = { id: 'q', text: 'Solve $x^2=4$', subject: 'math', tags: [], starred: false, createdAt: 0 };
const a: Answer = {
  id: 'a', questionId: 'q', mode: 'learn', finalAnswer: 'x = 2 or x = -2', verified: 'unchecked', model: 'm', createdAt: 0,
  steps: [
    { id: 's1', title: 'Take roots', body: 'Take the square root of both sides.' },
    { id: 's2', title: 'Note', body: '**Discriminant**: the value b^2 - 4ac that decides the number of roots' },
  ],
};

describe('buildLocalCards', () => {
  it('makes final, step and definition cards', () => {
    const c = buildLocalCards(q, a);
    expect(c[0].back).toBe('x = 2 or x = -2');
    expect(c.some((x) => x.front.includes('Step 1'))).toBe(true);
    expect(c.some((x) => x.front === 'What is Discriminant?')).toBe(true);
  });
  it('removes duplicates against existing cards', () => {
    const c = buildLocalCards(q, a);
    expect(dedupe(c, [{ front: 'solve $x^2=4$' }]).length).toBe(c.length - 1);
  });
});

describe('csv', () => {
  it('round-trips with tabs, quotes and newlines', () => {
    const cards = [{ front: 'A\nB', back: 'say "hi", ok', subject: 'other' as const }];
    for (const sep of ['\t', ','] as const) {
      const back = importCards(exportCards(cards, sep));
      expect(back[0]).toMatchObject({ front: 'A\nB', back: 'say "hi", ok', subject: 'other' });
    }
  });
  it('skips Anki comment lines', () => {
    expect(importCards('#separator:tab\nQ1\tA1\n')).toHaveLength(1);
  });
});
