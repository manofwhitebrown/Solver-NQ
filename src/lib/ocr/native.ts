import { OcrError } from './errors';

// ML Kit text recognition via a Capacitor plugin. Plugin not chosen yet (see docs/status/AI-4.md),
// so this throws and index.ts falls back to Tesseract.js.
export async function recognizeNative(_image: Blob | string): Promise<{ text: string; confidence: number }> {
  throw new OcrError('ocr-failed');
}
