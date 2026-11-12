import { getSettings } from '@/lib/settings';
import { recognizeNative } from './native';
import { isNative } from './platform';
import { recognizeWeb } from './web';

export { downloadPack, onOcrProgress } from './web';
export { BUNDLED_LANG, deleteCachedPack, formatBytes, listCachedPacks } from './langs';
export type { LangPack } from './langs';
export { isLowConfidence, LOW_CONFIDENCE, suggestsRotate } from './confidence';
export { OcrError, friendlyMessage } from './errors';
export { preprocess } from './preprocess';

export interface Recognized { text: string; confidence: number; backup?: boolean }

// Native ML Kit first. If it fails or finds nothing we quietly use Tesseract and
// set `backup` so the screen can say "Using backup reader".
export async function recognize(image: Blob | string): Promise<Recognized> {
  let backup = false;
  if (isNative()) {
    try {
      const r = await recognizeNative(image);
      if (r.text) return r;
    } catch {
      // fall through to the web engine
    }
    backup = true;
  }
  const r = await recognizeWeb(image, getSettings().ocrLang || 'eng');
  return backup ? { ...r, backup } : r;
}
