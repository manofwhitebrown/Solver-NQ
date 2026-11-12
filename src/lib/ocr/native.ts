import { OcrError } from './errors';

// On-device ML Kit via @pantrist/capacitor-plugin-ml-kit-text-recognition (Capacitor >= 8 compatible).
// Wrapped here so the plugin can be swapped without touching callers. Lazy-loaded.
// ML Kit gives no confidence score, so we return a rough one: high if it found text, 0 if not.
async function toBase64(image: Blob | string): Promise<string> {
  if (typeof image === 'string') return image.replace(/^data:[^;]+;base64,/, '');
  const url = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error('read failed'));
    r.readAsDataURL(image);
  });
  return url.replace(/^data:[^;]+;base64,/, '');
}

export async function recognizeNative(image: Blob | string): Promise<{ text: string; confidence: number }> {
  try {
    const { CapacitorPluginMlKitTextRecognition } = await import('@pantrist/capacitor-plugin-ml-kit-text-recognition');
    const { text } = await CapacitorPluginMlKitTextRecognition.detectText({ base64Image: await toBase64(image) });
    const t = text.trim();
    return { text: t, confidence: t ? 85 : 0 };
  } catch {
    throw new OcrError('ocr-failed');
  }
}
