import { describe, it, expect } from 'vitest';
import { asSubject, cardsFromImport } from './importCards';

describe('cardsFromImport', () => {
  it('skips duplicates and bad rows, validates subject, makes new cards', () => {
    const rows = [
      { front: 'Capital of France?', back: 'Paris', subject: 'History' },
      { front: 'capital of france', back: 'dup of the first', subject: 'other' },
      { front: 'Existing', back: 'x' },
      { front: 'Mystery', back: 'y', subject: 'astrology' },
    ];
    const out = cardsFromImport(rows, [{ front: 'existing' }], 'coding', 1000);
    expect(out.map((c) => c.front)).toEqual(['Capital of France?', 'Mystery']);
    expect(out[0]).toMatchObject({ subject: 'history', reps: 0, interval: 0, due: 1000 });
    expect(out[1].subject).toBe('coding');
    expect(new Set(out.map((c) => c.id)).size).toBe(2);
  });
  it('asSubject falls back', () => expect(asSubject('nope', 'math')).toBe('math'));
});
