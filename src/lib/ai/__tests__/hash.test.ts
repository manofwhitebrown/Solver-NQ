import { describe, it, expect } from 'vitest';
import { normaliseQuestion, questionHash } from '../hash';

describe('cache hash', () => {
  it('normalises case, spaces and trim', () => {
    expect(normaliseQuestion('  What  IS\n 2+2? ')).toBe('what is 2+2?');
  });
  it('same question gives same hash', () => {
    expect(questionHash(' Solve  X ', 'math', 'learn')).toBe(questionHash('solve x', 'math', 'learn'));
  });
  it('subject and mode change the hash', () => {
    const base = questionHash('q', 'math', 'learn');
    expect(questionHash('q', 'physics', 'learn')).not.toBe(base);
    expect(questionHash('q', 'math', 'answer')).not.toBe(base);
  });
});
