import { describe, it, expect } from 'vitest';
import { findGraphable } from './graphFind';
import { addTag, answerToMarkdown, answerToSpeech } from './answerText';
import type { Answer, Question } from '@/types';

const q = { id: 'q', text: 'Solve x+1=2', subject: 'math', tags: [], starred: false, createdAt: 0 } as Question;
const a: Answer = { id: 'a', questionId: 'q', mode: 'learn', finalAnswer: 'x = 1', summary: '',
  steps: [{ id: '1', title: 'Subtract', body: 'x = 2 - 1' }], verified: 'unchecked', model: 'm', createdAt: 0 };

describe('findGraphable', () => {
  it('finds y = and f(x) = forms', () => {
    expect(findGraphable('Plot y = x^2 - 4')).toBe('x^2 - 4');
    expect(findGraphable('Given $f(x) = \\sin x$, find its period')).toBe('sin(x)');
  });
  it('finds "graph x^2"', () => {
    expect(findGraphable('Graph x^2 + 1')).toBe('x^2 + 1');
  });
  it('ignores things that are not functions of x', () => {
    expect(findGraphable('Solve 2x + 3 = 11')).toBeNull();
    expect(findGraphable('y = 5 + t', 'The capital of France')).toBeNull();
  });
  it('checks later sources too', () => {
    expect(findGraphable('Describe the curve', 'The parabola y = x^2')).toBe('x^2');
  });
});

describe('answer text', () => {
  it('builds markdown and speech', () => {
    expect(answerToMarkdown(q, a)).toContain('1. **Subtract**');
    expect(answerToSpeech(a)).toMatch(/^Final answer\. x = 1/);
  });
  it('cleans tags', () => {
    expect(addTag(['a'], '  Hello   World ')).toEqual(['a', 'hello world']);
    expect(addTag(['a'], 'A')).toEqual(['a']);
    expect(addTag(['a'], '   ')).toEqual(['a']);
  });
});
