import type { ExportItem } from './markdown';
import type { ResolvedOptions } from './options';
import { markdownToPlain, pdfSafe, plainTitle } from './plaintext';
import { dateStamp } from './filename';

type Progress = (done: number, total: number) => void;

/** "Selectable text" PDF: real text, math as readable plain text. jsPDF is lazy-loaded. */
export async function buildTextPdf(
  items: ExportItem[], opts: ResolvedOptions, title: string, onProgress?: Progress,
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: opts.pageSize });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const lh = opts.fontSize * 1.45;
  let y = M;

  const ensure = (need: number) => { if (y + need > H - M) { doc.addPage(); y = M; } };
  const write = (text: string, size: number, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines: string[] = doc.splitTextToSize(pdfSafe(text), W - M * 2);
    for (const line of lines) { ensure(lh); doc.text(line, M, y); y += size * 1.45; }
  };

  doc.setTextColor(0);
  write(plainTitle(title, 80), opts.fontSize + 9, true);
  y += lh;
  items.forEach(({ q, a, image }, i) => {
    ensure(lh * 4);
    write(`${i + 1}. ${plainTitle(q.text, 90)}`, opts.fontSize + 3, true);
    if (opts.includeDate) write(`${q.subject} · ${dateStamp(q.createdAt)}`, opts.fontSize - 1);
    const rest = q.text.split('\n').slice(1).join('\n').trim();
    if (rest) write(markdownToPlain(rest), opts.fontSize); // heading already shows line 1
    if (image) {
      const w = Math.min(W - M * 2, 300);
      const h = Math.min((image.height / image.width) * w, 240);
      ensure(h + lh);
      doc.addImage(image.dataUrl, 'JPEG', M, y, (image.width / image.height) * h > w ? w : (image.width / image.height) * h, h);
      y += h + lh;
    }
    if (a) {
      write('Final answer', opts.fontSize, true);
      write(markdownToPlain(a.finalAnswer), opts.fontSize);
      if (opts.stepsMode === 'full') {
        a.steps.forEach((s, n) => {
          write(`Step ${n + 1}: ${s.title}`, opts.fontSize, true);
          write(markdownToPlain(s.body), opts.fontSize);
        });
      }
    }
    y += lh;
    onProgress?.(i + 1, items.length);
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Solver-NQ', M, H - 28);
    doc.text(`${p} / ${pages}`, W - M, H - 28, { align: 'right' });
  }
  return doc.output('blob');
}
