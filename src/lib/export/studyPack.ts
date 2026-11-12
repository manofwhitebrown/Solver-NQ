import type { Flashcard } from '@/types';
import type { ExportItem } from './markdown';
import type { ResolvedOptions, StudyPackFilter } from './options';
import { buildToc } from './pack';
import { markdownToPlain, pdfSafe } from './plaintext';
import { dateStamp } from './filename';

/**
 * Study pack: cover page, table of contents, answers, optional flashcards.
 * Cover/TOC/cards are real text; answer pages come from the chosen PDF mode and are merged.
 */
export async function buildPackPdf(
  items: ExportItem[], cards: Flashcard[], opts: ResolvedOptions, filter: StudyPackFilter,
  onProgress?: (d: number, t: number) => void, hooks: import('./pdfPretty').PrettyHooks = {},
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: opts.pageSize });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;

  doc.setFont('helvetica', 'bold').setFontSize(30).setTextColor(0);
  doc.text('Study pack', W / 2, H / 3, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(14);
  doc.text(filter.subject ? filter.subject : 'All subjects', W / 2, H / 3 + 32, { align: 'center' });
  doc.text(`${items.length} answers`, W / 2, H / 3 + 54, { align: 'center' });
  doc.setFontSize(11).setTextColor(110).text(dateStamp(Date.now()), W / 2, H / 3 + 80, { align: 'center' }).setTextColor(0);

  doc.addPage();
  doc.setFont('helvetica', 'bold').setFontSize(20).text('Contents', M, M + 10);
  doc.setFont('helvetica', 'normal').setFontSize(11);
  let y = M + 44;
  for (const t of buildToc(items)) {
    if (y > H - M) { doc.addPage(); y = M; }
    doc.text(pdfSafe(`${t.n}. ${t.title}`), M, y);
    y += 20;
  }

  const frontCount = doc.getNumberOfPages();
  const packOpts = { ...opts, includeCards: false };
  const body = opts.pdfMode === 'pretty'
    ? await (await import('./pdfPretty')).buildPrettyPdf(items, packOpts, 'Answers', onProgress, hooks)
    : await (await import('./pdfText')).buildTextPdf(items, packOpts, 'Answers', onProgress);

  if (cards.length) {
    doc.addPage();
    doc.setFont('helvetica', 'bold').setFontSize(20).text('Flashcards', M, M + 10);
    doc.setFont('helvetica', 'normal').setFontSize(11);
    y = M + 44;
    for (const c of cards) {
      const lines: string[] = doc.splitTextToSize(pdfSafe(`Q: ${markdownToPlain(c.front)}\nA: ${markdownToPlain(c.back)}`), W - M * 2);
      if (y + lines.length * 15 > H - M) { doc.addPage(); y = M; }
      doc.text(lines, M, y);
      y += lines.length * 15 + 12;
    }
  }
  // Order: cover + contents (front), answers (body), flashcards (back).
  const { PDFDocument } = await import('pdf-lib');
  const out = await PDFDocument.create();
  const front = await PDFDocument.load(doc.output('arraybuffer'));
  const bodyDoc = await PDFDocument.load(await body.arrayBuffer());
  const idx = front.getPageIndices();
  for (const pg of await out.copyPages(front, idx.slice(0, frontCount))) out.addPage(pg);
  for (const pg of await out.copyPages(bodyDoc, bodyDoc.getPageIndices())) out.addPage(pg);
  for (const pg of await out.copyPages(front, idx.slice(frontCount))) out.addPage(pg);
  const bytes = await out.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
