import { getImageUrl } from '@/lib/db';

export interface LoadedImage { dataUrl: string; bytes: Uint8Array; width: number; height: number }

const MAX_SIDE = 1200;

function b64ToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.split(',')[1] ?? '');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Loads a saved question image as a downscaled JPEG (one format for PDF and DOCX). Browser only. */
export async function loadImage(id: string): Promise<LoadedImage | undefined> {
  try {
    if (typeof document === 'undefined') return undefined;
    const url = await getImageUrl(id);
    if (!url) return undefined;
    const bmp = await createImageBitmap(await (await fetch(url)).blob());
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(bmp.width * scale));
    c.height = Math.max(1, Math.round(bmp.height * scale));
    const ctx = c.getContext('2d');
    if (!ctx) return undefined;
    ctx.fillStyle = '#fff'; // white background always (transparent PNGs, ink-friendly)
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    return { dataUrl, bytes: b64ToBytes(dataUrl), width: c.width, height: c.height };
  } catch {
    return undefined; // a missing image should never break the export
  }
}
