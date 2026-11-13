import type { ExportItem } from './markdown';
import type { ResolvedOptions } from './options';
import { markdownToPlain, plainTitle } from './plaintext';
import { dateStamp } from './filename';
import { hasComplexScript, isRtlParagraph } from './script';

/** DOCX with math as readable text. `docx` is lazy-loaded. */
export async function buildDocx(items: ExportItem[], opts: ResolvedOptions, title: string): Promise<Blob> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun, Footer, PageNumber, AlignmentType } = await import('docx');
  const size = opts.fontSize * 2; // half-points
  // Complex scripts (Hindi, Telugu, Urdu...) need a "cs" font and, for Urdu/Arabic, right-to-left runs and paragraphs.
  // Word shapes the letters itself; we only have to say which script settings apply.
  const csFont = (t: string) => (/[\u0600-\u08FF\uFB50-\uFEFF]/.test(t) ? 'Arial' : 'Nirmala UI');
  const runs = (text: string, o: { bold?: boolean; size?: number } = {}) => {
    const rtl = isRtlParagraph(text);
    const cs = hasComplexScript(text);
    return new TextRun({
      text, bold: o.bold, size: o.size ?? size,
      ...(cs ? { font: { ascii: 'Calibri', hAnsi: 'Calibri', cs: csFont(text) }, boldComplexScript: o.bold, sizeComplexScript: o.size ?? size } : {}),
      ...(rtl ? { rightToLeft: true } : {}),
    });
  };
  const bidi = (text: string) => (isRtlParagraph(text) ? { bidirectional: true, alignment: AlignmentType.START } : {});
  const para = (text: string, bold = false) =>
    new Paragraph({ spacing: { after: 120 }, ...bidi(text), children: [runs(text, { bold })] });
  const heading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], extra: { pageBreakBefore?: boolean } = {}) =>
    new Paragraph({ heading: level, ...bidi(text), ...extra, children: [new TextRun({ text, ...(hasComplexScript(text) ? { font: { cs: csFont(text) }, ...(isRtlParagraph(text) ? { rightToLeft: true } : {}) } : {}) })] });

  const children: InstanceType<typeof Paragraph>[] = [
    heading(plainTitle(title, 80), HeadingLevel.TITLE),
  ];
  let n = 0;
  for (const { q, a, image } of items) {
    n++;
    // Each answer starts on its own page, numbered when there is more than one.
    children.push(heading(items.length > 1 ? `${n}. ${plainTitle(q.text, 80)}` : plainTitle(q.text, 80), HeadingLevel.HEADING_1, { pageBreakBefore: n > 1 }));
    if (opts.includeDate) children.push(para(`${q.subject} · ${dateStamp(q.createdAt)}`));
    children.push(para('Question', true), ...markdownToPlain(q.text).split('\n').map((l) => para(l)));
    if (image) {
      const w = Math.min(420, image.width);
      children.push(new Paragraph({ children: [new ImageRun({
        type: 'jpg', data: image.bytes,
        transformation: { width: w, height: Math.round((image.height / image.width) * w) },
      })] }));
    }
    if (!a) continue;
    if (a.finalAnswer.trim()) {
      children.push(heading('Final answer', HeadingLevel.HEADING_2),
        ...markdownToPlain(a.finalAnswer).split('\n').map((l) => new Paragraph({
          spacing: { after: 120 }, shading: { fill: 'EEF3FA' }, ...bidi(l), children: [runs(l, { bold: true })] })));
    }
    if (opts.stepsMode === 'full') {
      a.steps.forEach((s, i) => {
        children.push(heading(`Step ${i + 1}: ${s.title}`, HeadingLevel.HEADING_3));
        markdownToPlain(s.body).split('\n').forEach((l) => children.push(para(l)));
      });
    }
  }
  const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
    new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: 18, color: '666666' })] })] });
  return Packer.toBlob(new Document({
    title: plainTitle(title, 80), creator: 'Solver-NQ',
    sections: [{ footers: { default: footer }, children }],
  }));
}
