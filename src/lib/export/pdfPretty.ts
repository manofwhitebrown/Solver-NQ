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
  if (a.finalAnswer.trim()) out.push(`<h3>Final answer</h3><p>${await mdToHtml(a.finalAnswer)}</p>`);
  if (opts.stepsMode === 'full') {
    for (const [i, s] of a.steps.entries()) {
      out.push(`<h4>Step ${i + 1}: ${await mdToHtml(s.title)}</h4><p>${await mdToHtml(s.body)}</p>`);
    }
  }
  return out;
}

export class AbortError extends Error {
  constructor() { super('Export cancelled'); this.name = 'AbortError'; }
}
const check = (s?: AbortSignal) => { if (s?.aborted) throw new AbortError(); };
const tick = () => new Promise<void>((r) => setTimeout(r, 0)); // let the UI breathe between blocks

export interface PrettyHooks { signal?: AbortSignal; onWarn?: (failed: number) => void; /** Filled with the page each answer starts on (1-based). */ pages?: number[] }

/**
 * "Pretty" PDF: each block is rasterised, so math is perfect. Blocks never split across pages.
 * Memory: one block lives in the DOM and as a canvas at a time (freed right after use).
 * A block that fails to render is replaced by a short text note; the rest of the pack carries on.
 */
export async function buildPrettyPdf(
  items: ExportItem[], opts: ResolvedOptions, title: string, onProgress?: Progress, hooks: PrettyHooks = {},
): Promise<Blob> {
  const { signal } = hooks;
  const [{ jsPDF }, { toCanvas }] = await Promise.all([import('jspdf'), import('html-to-image')]);
  await import('katex/dist/katex.min.css');
  const doc = new jsPDF({ unit: 'pt', format: opts.pageSize });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = W - M * 2;
  const px = Math.round(contentW * 96 / 72);

  // Always white paper, whatever the app theme is.
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-99999px;top:0;width:${px}px;background:#fff;color:#000;color-scheme:light;` +
    `font:${opts.fontSize * 96 / 72}px/1.5 system-ui,sans-serif;`;
  host.innerHTML = '<style>.blk{margin:.6em 0;overflow:hidden}.meta{color:#555;font-size:.85em}h2,h3,h4{margin:.3em 0}</style>';
  document.body.appendChild(host);

  let y = M;
  let failed = 0;

  const place = (canvas: HTMLCanvasElement) => {
    const h = (canvas.height / canvas.width) * contentW;
    const room = H - M * 2;
    if (h <= room) {
      if (y + h > H - M && y > M) { doc.addPage(); y = M; }
      doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', M, y, contentW, h);
      y += h;
      return;
    }
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
      part.width = part.height = 0;
    }
  };

  const renderBlock = async (html: string) => {
    const node = document.createElement('div');
    node.style.paddingBottom = '10px';
    node.innerHTML = html;
    host.appendChild(node);
    let canvas: HTMLCanvasElement | undefined;
    try {
      canvas = await toCanvas(node, { pixelRatio: SCALE, backgroundColor: '#fff' });
      place(canvas);
    } finally {
      node.remove();
      if (canvas) canvas.width = canvas.height = 0; // release the bitmap now, not at GC time
    }
  };

  const noteFailure = (what: string) => {
    failed++;
    if (y + 24 > H - M && y > M) { doc.addPage(); y = M; }
    doc.setFontSize(10); doc.setTextColor(150);
    doc.text(`(${what} could not be drawn in this PDF. Try the text PDF or Markdown.)`, M, y + 12);
    y += 24;
  };

  try {
    check(signal);
    await renderBlock(`<h1>${await mdToHtml(title)}</h1>`).catch((e) => { if (e instanceof AbortError) throw e; noteFailure('The title'); });
    for (const [i, it] of items.entries()) {
      check(signal);
      try {
        for (const html of await blocksFor(it, opts)) {
          check(signal);
          try { await renderBlock(html); } catch (e) { if (e instanceof AbortError) throw e; noteFailure('A part of this answer'); }
          if (hooks.pages && hooks.pages[i] === undefined) hooks.pages[i] = doc.getNumberOfPages();
          await tick();
        }
      } catch (e) {
        if (e instanceof AbortError) throw e;
        noteFailure(`Answer ${i + 1}`);
      }
      onProgress?.(i + 1, items.length);
    }
  } finally {
    host.remove();
  }
  hooks.onWarn?.(failed);
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
