import { getSettings } from '@/lib/settings';
import { recognizeNative } from './native';
import { isNative } from './platform';
import { recognizeWeb } from './web';

export { isLowConfidence, LOW_CONFIDENCE } from './confidence';
export { OcrError, friendlyMessage } from './errors';
export { preprocess } from './preprocess';

export async function recognize(image: Blob | string): Promise<{ text: string; confidence: number }> {
  if (isNative()) {
    try {
      return await recognizeNative(image);
    } catch {
      // fall through to the web engine
    }
  }
  return recognizeWeb(image, getSettings().ocrLang || 'eng');
}
