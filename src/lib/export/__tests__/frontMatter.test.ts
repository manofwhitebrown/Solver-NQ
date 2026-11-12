import { describe, expect, it } from 'vitest';
import { frontMatter, tagSlug } from '../frontMatter';
import { itemsToMarkdown, type ExportItem } from '../markdown';
import { defaultOptions } from '../options';

const item = (subject: string, tags: string[], createdAt: number): ExportItem => ({
  q: { id: 'q', text: 'Solve $x^2=4$', subject, tags, starred: false, createdAt } as ExportItem['q'],
});

describe('frontMatter', () => {
  it('slugs tags for Obsidian', () => {
    expect(tagSlug(' #Exam prep!')).toBe('Exam-prep');
  });
  it('writes valid YAML with subject, tags and date', () => {
    const fm = frontMatter([item('math', ['quadratics', 'exam prep'], new Date(2026, 10, 12, 10).getTime())], 'My "title": set');
    expect(fm.startsWith('---\ntitle: "My \\"title\\": set"\nsubject: "math"\n')).toBe(true);
    expect(fm).toContain('tags: ["math", "quadratics", "exam-prep"]');
    expect(fm).toContain('date: 2026-11-12');
    expect(fm.trimEnd().endsWith('---')).toBe(true);
  });
  it('lists several subjects', () => {
    expect(frontMatter([item('math', [], 1), item('physics', [], 2)], 't')).toContain('subject: ["math", "physics"]');
  });
});

describe('itemsToMarkdown', () => {
  it('adds front matter only when asked', () => {
    const items = [item('math', [], 1)];
    expect(itemsToMarkdown(items, defaultOptions, 'T', true).startsWith('---\n')).toBe(true);
    expect(itemsToMarkdown(items, defaultOptions, 'T').startsWith('# T')).toBe(true);
  });
});
