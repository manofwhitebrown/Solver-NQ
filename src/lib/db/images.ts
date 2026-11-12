import { db } from './db';

const THUMB = 160;
const urls = new Map<string, string>();

/** Small JPEG thumbnail; returns undefined where canvas is unavailable (e.g. tests). */
export async function makeThumbnail(blob: Blob): Promise<Blob | undefined> {
  try {
    if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return undefined;
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, THUMB / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(bmp.width * scale));
    c.height = Math.max(1, Math.round(bmp.height * scale));
    c.getContext('2d')?.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    return await new Promise<Blob | undefined>(res => c.toBlob(b => res(b ?? undefined), 'image/jpeg', 0.7));
  } catch { return undefined; }
}

export async function saveImage(blob: Blob): Promise<string> {
  const id = crypto.randomUUID();
  const thumb = await makeThumbnail(blob);
  await db.images.put({ id, blob, thumb, createdAt: Date.now() });
  return id;
}

/** Object URL for an image (or its thumbnail). Cached; call revokeImageUrls() on cleanup. */
export async function getImageUrl(id: string, thumb = false): Promise<string | undefined> {
  const key = `${id}:${thumb ? 't' : 'f'}`;
  const hit = urls.get(key);
  if (hit) return hit;
  const row = await db.images.get(id);
  const b = thumb ? row?.thumb ?? row?.blob : row?.blob;
  if (!b) return undefined;
  const url = URL.createObjectURL(b);
  urls.set(key, url);
  return url;
}

export function revokeImageUrls(): void {
  urls.forEach(u => URL.revokeObjectURL(u));
  urls.clear();
}
