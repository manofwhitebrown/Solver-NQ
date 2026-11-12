import { OcrError } from './errors';

// Tesseract.js is lazy-loaded so it never lands in the main bundle.
// Language data is cached in IndexedDB by Tesseract (cacheMethod 'write'),
// so OCR works offline after the first use.
type Worker = import('tesseract.js').Worker;
let worker: Worker | null = null;
let workerLang = '';

async function getWorker(lang: string): Promise<Worker> {
  if (worker && workerLang === lang) return worker;
  if (worker) await worker.terminate();
  const { createWorker } = await import('tesseract.js');
  worker = await createWorker(lang, 1, { cacheMethod: 'write' });
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
