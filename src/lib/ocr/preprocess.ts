// Canvas preprocessing: downscale, grayscale, contrast boost, optional threshold.
export interface PreprocessOptions {
  maxSide?: number;      // default 2000
  contrast?: number;     // 1 = none, default 1.4
  threshold?: boolean;   // hard black/white
  rotate?: 0 | 90 | 180 | 270;
  color?: boolean;       // keep colours (no grayscale), used for the image sent to the AI
}

export function fitSize(w: number, h: number, maxSide: number) {
  const s = Math.min(1, maxSide / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

// Otsu's method on a 256-bin histogram.
export function otsu(hist: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, level = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const diff = sumB / wB - (sum - sumB) / wF;
    const v = wB * wF * diff * diff;
    if (v > best) { best = v; level = t; }
  }
  return level;
}

export function enhancePixels(data: Uint8ClampedArray, contrast: number, threshold: boolean) {
  const hist = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const c = Math.max(0, Math.min(255, (g - 128) * contrast + 128));
    data[i] = data[i + 1] = data[i + 2] = c;
    hist[Math.round(c)]++;
  }
  if (!threshold) return;
  const level = otsu(hist, data.length / 4);
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] > level ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
  }
}

export async function preprocess(src: ImageBitmap | HTMLImageElement | HTMLCanvasElement, o: PreprocessOptions = {}): Promise<Blob> {
  const { maxSide = 2000, contrast = 1.4, threshold = false, rotate = 0, color = false } = o;
  const sw = 'naturalWidth' in src ? src.naturalWidth : src.width;
  const sh = 'naturalHeight' in src ? src.naturalHeight : src.height;
  const { width, height } = fitSize(sw, sh, maxSide);
  const swap = rotate === 90 || rotate === 270;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? height : width;
  canvas.height = swap ? width : height;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.drawImage(src, -width / 2, -height / 2, width, height);
  if (!color) {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    enhancePixels(img.data, contrast, threshold);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(img, 0, 0);
  }
  const type = color ? 'image/jpeg' : 'image/png';
  return new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error('encode failed'))), type, 0.9));
}
