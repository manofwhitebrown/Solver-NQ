import { OcrError } from './errors';

// Tesseract.js is lazy-loaded so it never lands in the main bundle.
// Language data is cached in IndexedDB by Tesseract (cacheMethod 'write'),
// so OCR works offline after the first use.
type Worker = import('tesseract.js').Worker;
let worker: Worker | null = null;
let workerLang = '';
let progressCb: ((pct: number) => void) | null = null;
/** Subscribe to 0-100 progress of web OCR. Returns an unsubscribe function. */
export function onOcrProgress(cb: (pct: number) => void) {
  progressCb = cb;
  return () => { if (progressCb === cb) progressCb = null; };
}

async function getWorker(lang: string): Promise<Worker> {
  if (worker && workerLang === lang) return worker;
  if (worker) await worker.terminate();
  const { createWorker } = await import('tesseract.js');
  worker = await createWorker(lang, 1, {
    cacheMethod: 'write',
    logger: m => { if (m.status === 'recognizing text') progressCb?.(Math.round(m.progress * 100)); },
  });
  workerLang = lang;
  return worker;
}

export async function recognizeWeb(image: Blob | string, lang = 'eng') {
  try {
    const w = await getWorker(lang);
    const { data } = await w.recognize(image);
    return { text: data.text.trim(), confidence: Math.round(data.confidence) };
  } catch {
    worker = null;
    throw new OcrError(navigator.onLine ? 'ocr-failed' : 'offline-no-data');
  }
}

export async function disposeWeb() {
  await worker?.terminate();
  worker = null;
}
