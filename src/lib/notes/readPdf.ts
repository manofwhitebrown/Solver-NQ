export interface PdfRead { text: string; pages: number; scanned: number[]; ocrUsed: number }
export interface PdfOptions {
  /** OCR for a page with no text layer (browser only). Receives a rendered JPEG. */
  ocr?: (page: Blob) => Promise<string>;
  onProgress?: (page: number, total: number) => void;
  maxPages?: number;
  /** Tests (Node) pass the legacy build here; the app uses the default lazy import. */
  loader?: () => Promise<typeof import('pdfjs-dist')>;
}

const MIN_TEXT = 25; // fewer characters than this on a page = treat as scanned

async function pdfjs() {
  const lib = await import('pdfjs-dist'); // lazy: never in the main bundle
  lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  return lib;
}

async function renderJpeg(page: import('pdfjs-dist').PDFPageProxy): Promise<Blob> {
  const vp = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
  await page.render({ canvas, viewport: vp }).promise;
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.9));
}

export async function readPdf(data: ArrayBuffer | Uint8Array, opts: PdfOptions = {}): Promise<PdfRead> {
  const lib = await (opts.loader ?? pdfjs)();
  const task = lib.getDocument({ data: data instanceof Uint8Array ? data : new Uint8Array(data) });
  const doc = await task.promise;
  const total = Math.min(doc.numPages, opts.maxPages ?? 200);
  const parts: string[] = [];
  const scanned: number[] = [];
  let ocrUsed = 0;
  for (let n = 1; n <= total; n++) {
    opts.onProgress?.(n, total);
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    let text = content.items.map((it) => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : '')).join('')
      .replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();
    if (text.length < MIN_TEXT) {
      scanned.push(n);
      if (opts.ocr) {
        try { text = (await opts.ocr(await renderJpeg(page))).trim(); ocrUsed++; } catch { /* leave the page empty */ }
      }
    }
    if (text) parts.push(text);
  }
  await task.destroy();
  return { text: parts.join('\n\n'), pages: total, scanned, ocrUsed };
}
