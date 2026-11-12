import type { ExportItem } from './markdown';
import type { ResolvedOptions } from './options';
import { mdToHtml } from './html';
import { dateStamp } from './filename';
import { planSlices } from './slice';

type Progress = (done: number, total: number) => void;
const SCALE = 2; // raster resolution multiplier

async function blocksFor(item: ExportItem, opts: ResolvedOptions): Promise<string[]> {
  const { q, a, image } = item;
  const out: string[] = [];
  const meta = opts.includeDate ? `<div class="meta">${q.subject} · ${dateStamp(q.createdAt)}</div>` : '';
  const rest = q.text.split('\n').slice(1).join('\n').trim(); // heading already shows line 1
  out.push(`<h2>${await mdToHtml(q.text.split('\n')[0])}</h2>${meta}${rest ? `<p>${await mdToHtml(rest)}</p>` : ''}` +
    (image ? `<img src="${image.dataUrl}" style="max-width:70%;max-height:280px;margin:.4em 0">` : ''));
  if (!a) return out;
  out.push(`<h3>Final answer</h3><p>${await mdToHtml(a.finalAnswer)}</p>`);
  if (opts.stepsMode === 'full') {
    for (const [i, s] of a.steps.entries()) {
      out.push(`<h4>Step ${i + 1}: ${await mdToHtml(s.title)}</h4><p>${await mdToHtml(s.body)}</p>`);
    }
  }
  return out;
}

/** "Pretty" PDF: each block is rasterised, so math is perfect. Blocks never split across pages. */
export async function buildPrettyPdf(
  items: ExportItem[], opts: ResolvedOptions, title: string, onProgress?: Progress,
): Promise<Blob> {
  const [{ jsPDF }, { toCanvas }] = await Promise.all([import('jspdf'), import('html-to-image')]);
  await import('katex/dist/katex.min.css');
  const doc = new jsPDF({ unit: 'pt', format: opts.pageSize });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = W - M * 2;
  const px = Math.round(contentW * 96 / 72);

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-99999px;top:0;width:${px}px;background:#fff;color:#000;` +
    `font:${opts.fontSize * 96 / 72}px/1.5 system-ui,sans-serif;`;
  host.innerHTML = '<style>.blk{margin:.6em 0;overflow:hidden}.meta{color:#555;font-size:.85em}h2,h3,h4{margin:.3em 0}</style>';
  document.body.appendChild(host);

  let y = M;
  try {
    const head = document.createElement('div');
    head.innerHTML = `<h1>${await mdToHtml(title)}</h1>`;
    host.appendChild(head);
    const blocks: string[] = [];
    for (const [i, it] of items.entries()) {
      blocks.push(...await blocksFor(it, opts));
      onProgress?.(i + 1, items.length * 2);
    }
    const nodes = [head, ...blocks.map((html) => {
      const d = document.createElement('div');
      d.style.paddingBottom = '10px';
      d.innerHTML = html;
      host.appendChild(d);
      return d;
    })];
    for (const [i, node] of nodes.entries()) {
      const canvas = await toCanvas(node, { pixelRatio: SCALE, backgroundColor: '#fff' });
      const h = (canvas.height / canvas.width) * contentW;
      const room = H - M * 2;
      if (h <= room) {
        if (y + h > H - M && y > M) { doc.addPage(); y = M; }
        doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', M, y, contentW, h);
        y += h;
      } else {
        // Taller than a page: cut at gaps between lines, one slice per page.
        if (y > M) { doc.addPage(); y = M; }
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const blank = (row: number) => ctx.getImageData(0, row, canvas.width, 1).data.every((v, i) => i % 4 === 3 || v > 245);
        const ptPerRow = contentW / canvas.width;
        for (const [from, to] of planSlices(canvas.height, Math.floor(room / ptPerRow), blank)) {
          const part = document.createElement('canvas');
          part.width = canvas.width; part.height = to - from;
          part.getContext('2d')!.drawImage(canvas, 0, from, canvas.width, to - from, 0, 0, canvas.width, to - from);
          if (y > M) { doc.addPage(); y = M; }
          doc.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', M, y, contentW, (to - from) * ptPerRow);
          y += (to - from) * ptPerRow;
        }
      }
      onProgress?.(items.length + Math.round(((i + 1) / nodes.length) * items.length), items.length * 2);
    }
  } finally {
    host.remove();
  }
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Solver-NQ', M, H - 24);
    doc.text(`${p} / ${pages}`, W - M, H - 24, { align: 'right' });
  }
  return doc.output('blob');
}
