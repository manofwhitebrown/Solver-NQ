// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Answer, Question } from '@/types';
import { answerHealth, dropIncomplete } from '../complete';
import { defaultOptions } from '../options';
import { itemToMarkdown } from '../markdown';
import { buildPackPdf } from '../studyPack';
import { PDFDocument } from 'pdf-lib';

const q = (i: number): Question => ({ id: `q${i}`, text: `Q${i} solve $x+${i}=9$`, subject: 'math', tags: [], starred: false, createdAt: 0 });
const ans = (i: number, p: Partial<Answer>): Answer => ({ id: `a${i}`, questionId: `q${i}`, mode: 'answer', finalAnswer: 'x=1', steps: [{ id: 's', title: 'T', body: 'b' }], verified: 'unchecked', model: 'm', createdAt: 0, ...p });

describe('incomplete answers are not exported', () => {
  it('classifies blank, cut-off and good answers', () => {
    expect(answerHealth(ans(1, { finalAnswer: '', steps: [] }))).toBe('blank');
    expect(answerHealth(ans(1, { finalAnswer: '', steps: [{ id: 's', title: 'Answer', body: '{"finalAnswer":"x=' }] }))).toBe('cut');
    expect(answerHealth(ans(1, { finalAnswer: '', steps: [{ id: 's', title: 'Answer', body: '```json\n{"steps":[' }] }))).toBe('cut');
    expect(answerHealth(ans(1, {}))).toBe('ok');
    expect(answerHealth(undefined)).toBe('ok');
    expect(answerHealth(ans(1, { finalAnswer: '', steps: [{ id: 's', title: 'Plain', body: 'Just words.' }] }))).toBe('ok');
  });

  it('dropIncomplete counts what it skipped', () => {
    const r = dropIncomplete([{ q: q(1), a: ans(1, {}) }, { q: q(2), a: ans(2, { finalAnswer: '', steps: [] }) }, { q: q(3) }]);
    expect(r.items.map((i) => i.q.id)).toEqual(['q1', 'q3']);
    expect(r.skipped).toBe(1);
  });

  it('markdown has no empty "Final answer" heading', () => {
    const md = itemToMarkdown({ q: q(1), a: ans(1, { finalAnswer: '' }) }, defaultOptions);
    expect(md).not.toMatch(/Final answer/);
    expect(md).toMatch(/Step 1/);
  });
});

describe('study pack at scale (text pages, no browser)', () => {
  it('600 answers build into one valid PDF in a few seconds', async () => {
    const items = Array.from({ length: 600 }, (_, i) => ({ q: q(i), a: ans(i, { steps: Array.from({ length: 3 }, (_, s) => ({ id: `s${s}`, title: `Step ${s}`, body: 'Work through the algebra carefully. '.repeat(5) })) }) }));
    const t = performance.now();
    const blob = await buildPackPdf(items, [], { ...defaultOptions, pdfMode: 'text' }, {});
    const ms = Math.round(performance.now() - t);
    const pdf = await PDFDocument.load(await blob.arrayBuffer());
    console.log(`study pack, 600 answers (text): ${ms} ms, ${(blob.size / 1048576).toFixed(2)} MB, ${pdf.getPageCount()} pages`);
    expect(pdf.getPageCount()).toBeGreaterThan(150); // 600 answers, about 3 per page
    expect(ms).toBeLessThan(60_000);
  }, 90_000);
});
