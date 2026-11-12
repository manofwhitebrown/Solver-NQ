import { OcrError } from '@/lib/ocr';
import { MAX_FILE_BYTES } from './imageTools';

// pdf.js is lazy-loaded: nothing here ends up in the main bundle.
type Doc = import('pdfjs-dist').PDFDocumentProxy;

async function lib() {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  return pdfjs;
}

export async function openPdf(file: Blob): Promise<Doc> {
  if (file.size > MAX_FILE_BYTES) throw new OcrError('too-large');
  try {
    const pdfjs = await lib();
    return await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  } catch {
    throw new OcrError('ocr-failed');
  }
}

// Render one page (1-based) to a JPEG. scale 1 = 72 dpi; ~2 is crisp enough for OCR.
export async function renderPage(doc: Doc, pageNo: number, scale = 2): Promise<Blob> {
  const page = await doc.getPage(pageNo);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(vp.width);
  canvas.height = Math.round(vp.height);
  await page.render({ canvas, viewport: vp }).promise;
  return new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('encode failed'))), 'image/jpeg', 0.9));
}
