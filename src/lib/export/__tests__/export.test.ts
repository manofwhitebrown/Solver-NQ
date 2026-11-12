import { describe, expect, it } from 'vitest';
import type { Answer, Question } from '@/types';
import { makeFilename, dateStamp } from '../filename';
import { latexToText, markdownToPlain } from '../plaintext';
import { itemsToMarkdown } from '../markdown';
import { filterItems, buildToc } from '../pack';
import { defaultOptions, resolveOptions } from '../options';

const q = (over: Partial<Question> = {}): Question => ({
  id: 'q1', text: 'Solve $x^2-5x+6=0$', subject: 'math', tags: ['algebra'],
  starred: false, createdAt: new Date(2026, 10, 12).getTime(), ...over,
});
const a: Answer = {
  id: 'a1', questionId: 'q1', mode: 'answer', finalAnswer: '$x=2$ or $x=3$',
  steps: [{ id: 's1', title: 'Factor', body: '$(x-2)(x-3)=0$' }],
  summary: 'Done', verified: 'match', model: 'm', createdAt: 0,
};

describe('filename', () => {
  it('matches the example format', () => {
    const now = new Date(2026, 10, 12).getTime();
    expect(makeFilename('math', 'Quadratic equations', 'pdf', now)).toBe('Math - Quadratic equations - 2026-11-12.pdf');
    expect(dateStamp(now)).toBe('2026-11-12');
  });
  it('strips illegal characters and math markup', () => {
    const f = makeFilename('math', 'Solve $x^2$: a/b?', 'md', 0);
    expect(f).not.toMatch(/[\\/:*?"<>|$]/);
  });
});

describe('plaintext', () => {
  it('converts fractions, sqrt and symbols', () => {
    expect(latexToText('\\frac{a}{b}')).toBe('(a)/(b)');
    expect(latexToText('\\sqrt{x}')).toBe('√(x)');
    expect(latexToText('a \\times b \\leq \\pi')).toBe('a × b ≤ π');
    expect(latexToText('x^{2}')).toBe('x^(2)');
  });
  it('strips markdown and keeps math readable', () => {
    expect(markdownToPlain('## Hi\n**bold** $x^{2}$')).toBe('Hi\nbold x^(2)');
  });
});

describe('markdown', () => {
  it('keeps $ math and includes steps in full mode', () => {
    const md = itemsToMarkdown([{ q: q(), a }], { ...defaultOptions, stepsMode: 'full' });
    expect(md).toContain('$x^2-5x+6=0$');
    expect(md).toContain('Step 1: Factor');
    expect(md).toContain('$(x-2)(x-3)=0$');
  });
  it('omits steps in final-only mode', () => {
    const md = itemsToMarkdown([{ q: q(), a }], { ...defaultOptions, stepsMode: 'final' });
    expect(md).not.toContain('Step 1');
    expect(md).toContain('**Final answer**');
  });
});

describe('pack + options', () => {
  const items = [
    { q: q() },
    { q: q({ id: 'q2', subject: 'physics', tags: [], starred: true, createdAt: new Date(2026, 0, 1).getTime() }) },
  ];
  it('filters by subject, tag, starred and dates', () => {
    expect(filterItems(items, { subject: 'math' })).toHaveLength(1);
    expect(filterItems(items, { tag: 'algebra' })).toHaveLength(1);
    expect(filterItems(items, { starred: true })[0].q.id).toBe('q2');
    expect(filterItems(items, { from: new Date(2026, 5, 1).getTime() })).toHaveLength(1);
    expect(buildToc(items)).toHaveLength(2);
  });
  it('maps contract options onto internal ones', () => {
    expect(resolveOptions({ paper: 'letter', includeSteps: false }).pageSize).toBe('letter');
    expect(resolveOptions({ includeSteps: false }).stepsMode).toBe('final');
    expect(resolveOptions({ fontSize: 99 }).fontSize).toBe(16);
  });
});
