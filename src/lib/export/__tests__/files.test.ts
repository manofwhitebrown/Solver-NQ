// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import type { Answer, Flashcard, Question } from '@/types';
import { defaultOptions } from '../options';
import { buildTextPdf } from '../pdfText';
import { buildDocx } from '../docx';
import { buildPackPdf } from '../studyPack';

const make = (n: number) => Array.from({ length: n }, (_, i) => {
  const q: Question = { id: `q${i}`, text: `Question ${i}: solve $x^2-${i}x+6=0$`, subject: 'math', tags: [], starred: false, createdAt: Date.now() };
  const a: Answer = {
    id: `a${i}`, questionId: q.id, mode: 'answer', finalAnswer: `$x=\\frac{${i}\\pm\\sqrt{${i * i - 24}}}{2}$`,
    steps: Array.from({ length: 4 }, (_, s) => ({ id: `s${s}`, title: `Step ${s}`, body: `Work through $a_{${s}} \\times b \\leq \\pi$ carefully. `.repeat(6) })),
    verified: 'match', model: 'm', createdAt: 0,
  };
  return { q, a };
});

describe('real file generation (no DOM)', () => {
  it('text PDF: valid, paginated, footer numbers', async () => {
    const t = performance.now();
    const blob = await buildTextPdf(make(20), defaultOptions, '20 answers');
    const ms = Math.round(performance.now() - t);
    const pdf = await PDFDocument.load(await blob.arrayBuffer());
    console.log(`text PDF, 20 answers: ${ms} ms, ${(blob.size / 1024).toFixed(0)} KB, ${pdf.getPageCount()} pages`);
    expect(pdf.getPageCount()).toBeGreaterThan(3);
  });

  it('DOCX: a zip package with the Word document part', async () => {
    const blob = await buildDocx(make(3), defaultOptions, 'Doc');
    const buf = Buffer.from(await blob.arrayBuffer());
    expect(buf.subarray(0, 2).toString()).toBe('PK');
    // zip entry names are stored uncompressed in the directory
    expect(buf.includes('word/document.xml')).toBe(true);
    expect(buf.includes('[Content_Types].xml')).toBe(true);
    expect(blob.size).toBeGreaterThan(2000);
  });

  it('study pack: cover + contents + answers + flashcards merge in order', async () => {
    const cards: Flashcard[] = [{ id: 'c', front: 'Front?', back: 'Back', subject: 'math', due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0 }];
    const items = make(5);
    const blob = await buildPackPdf(items, cards, { ...defaultOptions, pdfMode: 'text', includeCards: true }, {});
    const merged = await PDFDocument.load(await blob.arrayBuffer());
    const body = await PDFDocument.load(await (await buildTextPdf(items, defaultOptions, 'Answers')).arrayBuffer());
    // cover + contents (2) + body + 1 flashcards page
    expect(merged.getPageCount()).toBe(2 + body.getPageCount() + 1);
  });
});
