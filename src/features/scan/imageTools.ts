import { OcrError, preprocess } from '@/lib/ocr';
import { toPixels, type Rect } from './cropMath';

export const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function loadBitmap(blob: Blob): Promise<ImageBitmap> {
  if (blob.size > MAX_FILE_BYTES) throw new OcrError('too-large');
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    throw new OcrError('ocr-failed');
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error('read failed'));
    r.readAsDataURL(blob);
  });
}

function canvasBlob(c: HTMLCanvasElement, type = 'image/jpeg', q = 0.9): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('encode failed'))), type, q));
}

export async function rotate90(blob: Blob): Promise<Blob> {
  const bmp = await loadBitmap(blob);
  const c = document.createElement('canvas');
  c.width = bmp.height; c.height = bmp.width;
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
  bmp.close();
  return canvasBlob(c);
}

export interface Cropped { blob: Blob; ocrBlob: Blob; dataUrl: string }

// blob: the clean crop (sent to the AI). ocrBlob: enhanced copy used only for OCR.
export async function cropBlob(src: Blob, r: Rect, enhance: boolean): Promise<Cropped> {
  const bmp = await loadBitmap(src);
  const { sx, sy, sw, sh } = toPixels(r, bmp.width, bmp.height);
  const c = document.createElement('canvas');
  c.width = sw; c.height = sh;
  c.getContext('2d')!.drawImage(bmp, sx, sy, sw, sh, 0, 0, sw, sh);
  bmp.close();
  // Keep what we send to the AI small: <= 1600px on the long side.
  const clean = await preprocess(c, { maxSide: 1600, contrast: 1, color: true });
  const ocrBlob = enhance ? await preprocess(c, { contrast: 1.5, threshold: false }) : clean;
  return { blob: clean, ocrBlob, dataUrl: await blobToDataUrl(clean) };
}
