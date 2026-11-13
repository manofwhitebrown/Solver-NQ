import type { ExportItem } from './markdown';
import type { ResolvedOptions } from './options';
import { markdownToPlain, plainTitle } from './plaintext';
import { dateStamp } from './filename';

/** DOCX with math as readable text. `docx` is lazy-loaded. */
export async function buildDocx(items: ExportItem[], opts: ResolvedOptions, title: string): Promise<Blob> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun, Footer, PageNumber, AlignmentType } = await import('docx');
  const size = opts.fontSize * 2; // half-points
  const para = (text: string, bold = false) =>
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, bold, size })] });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: plainTitle(title, 80), heading: HeadingLevel.TITLE }),
  ];
  let n = 0;
  for (const { q, a, image } of items) {
    n++;
    // Each answer starts on its own page, numbered when there is more than one.
    children.push(new Paragraph({ text: items.length > 1 ? `${n}. ${plainTitle(q.text, 80)}` : plainTitle(q.text, 80), heading: HeadingLevel.HEADING_1, pageBreakBefore: n > 1 }));
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
      children.push(new Paragraph({ text: 'Final answer', heading: HeadingLevel.HEADING_2 }),
        ...markdownToPlain(a.finalAnswer).split('\n').map((l) => new Paragraph({
          spacing: { after: 120 }, shading: { fill: 'EEF3FA' }, children: [new TextRun({ text: l, bold: true, size })] })));
    }
    if (opts.stepsMode === 'full') {
      a.steps.forEach((s, i) => {
        children.push(new Paragraph({ text: `Step ${i + 1}: ${s.title}`, heading: HeadingLevel.HEADING_3 }));
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
