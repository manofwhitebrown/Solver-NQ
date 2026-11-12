import type { ExportItem } from './markdown';
import type { ResolvedOptions } from './options';
import { markdownToPlain, plainTitle } from './plaintext';
import { dateStamp } from './filename';

/** DOCX with math as readable text. `docx` is lazy-loaded. */
export async function buildDocx(items: ExportItem[], opts: ResolvedOptions, title: string): Promise<Blob> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun, ImageRun } = await import('docx');
  const size = opts.fontSize * 2; // half-points
  const para = (text: string, bold = false) =>
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, bold, size })] });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ text: plainTitle(title, 80), heading: HeadingLevel.TITLE }),
  ];
  for (const { q, a, image } of items) {
    children.push(new Paragraph({ text: plainTitle(q.text, 80), heading: HeadingLevel.HEADING_1 }));
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
    children.push(para('Final answer', true), ...markdownToPlain(a.finalAnswer).split('\n').map((l) => para(l)));
    if (opts.stepsMode === 'full') {
      a.steps.forEach((s, i) => {
        children.push(new Paragraph({ text: `Step ${i + 1}: ${s.title}`, heading: HeadingLevel.HEADING_2 }));
        markdownToPlain(s.body).split('\n').forEach((l) => children.push(para(l)));
      });
    }
  }
  return Packer.toBlob(new Document({ sections: [{ children }] }));
}
