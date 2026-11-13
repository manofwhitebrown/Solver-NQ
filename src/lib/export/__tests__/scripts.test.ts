import { describe, expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import type { Answer, Question } from '@/types';
import { buildDocx } from '../docx';
import { buildTextPdf } from '../pdfText';
import { defaultOptions } from '../options';
import { isRtlParagraph, itemsNeedUnicodeFont, needsUnicodeFont } from '../script';

const HI = 'द्विघात समीकरण हल करें';
const TE = 'వర్గ సమీకరణం పరిష్కరించండి';
const UR = 'دو درجی مساوات حل کریں';

const item = (t: string) => {
  const q: Question = { id: 'q', text: t, subject: 'math', tags: [], starred: false, createdAt: 0 };
  const a: Answer = { id: 'a', questionId: 'q', mode: 'answer', finalAnswer: t, steps: [{ id: 's', title: t, body: t }], summary: '', verified: 'match', model: 'm', createdAt: 0 };
  return { q, a };
};
const docxXml = async (items: ReturnType<typeof item>[]) =>
  strFromU8(unzipSync(new Uint8Array(await (await buildDocx(items, defaultOptions, 'Test')).arrayBuffer()))['word/document.xml']);

describe('script detection', () => {
  it('flags Hindi, Telugu and Urdu but not Latin or maths symbols', () => {
    for (const t of [HI, TE, UR]) expect(needsUnicodeFont(t)).toBe(true);
    expect(needsUnicodeFont('Solve x² + 3 ≤ π → ∞ “quoted” café')).toBe(false);
    expect(itemsNeedUnicodeFont([item('Solve x=2')])).toBe(false);
    expect(itemsNeedUnicodeFont([item(`Q: ${HI}`)])).toBe(true);
  });
  it('treats Urdu as right-to-left and Hindi/English as left-to-right', () => {
    expect(isRtlParagraph(UR)).toBe(true);
    expect(isRtlParagraph(HI)).toBe(false);
    expect(isRtlParagraph('Solve x = 2')).toBe(false);
  });
});

describe('DOCX with Indic and Urdu text', () => {
  it('keeps all three scripts and marks Urdu right-to-left with a complex-script font', async () => {
    const xml = await docxXml([HI, TE, UR].map(item));
    for (const t of [HI, TE, UR]) expect(xml).toContain(t);
    expect(xml).toContain('<w:bidi'); // Urdu paragraphs
    expect(xml).toContain('<w:rtl'); // Urdu runs
    expect(xml).toMatch(/w:cs="Nirmala UI"/); // Hindi / Telugu
    expect(xml).toMatch(/w:cs="Arial"/); // Urdu
  });
  it('adds no right-to-left settings to an English-only document', async () => {
    const xml = await docxXml([item('Solve x=2')]);
    expect(xml).not.toContain('<w:bidi');
    expect(xml).not.toContain('<w:rtl');
  });
});

describe('text PDF', () => {
  it('still extracts Latin text and maths symbols back from the PDF', async () => {
    const pdf = await buildTextPdf([item('Solve x² ≤ 4')], { ...defaultOptions, pdfMode: 'text' }, 'Test');
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await pdf.arrayBuffer()), verbosity: 0 }).promise;
    const items = (await (await doc.getPage(1)).getTextContent()).items as { str: string }[];
    const text = items.map((i) => i.str).join(' ');
    expect(text).toContain('Solve');
    expect(text).toContain('<=');
  });
});
