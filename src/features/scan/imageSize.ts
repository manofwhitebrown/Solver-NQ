import { fitSize } from '@/lib/ocr/preprocess';

// Phone photos can be 12-48 MP. We never decode them at full size: read the size
// from the file header, then ask the browser to decode straight to a smaller bitmap.
export const MAX_DECODE_SIDE = 2400;

export interface ImageInfo { width: number; height: number }

// Size as displayed (after EXIF rotation) from a JPEG or PNG header. null = unknown.
export function parseImageInfo(b: Uint8Array): ImageInfo | null {
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {
    const dv = new DataView(b.buffer, b.byteOffset);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let orient = 1, dims: ImageInfo | null = null, i = 2;
  while (i + 4 < b.length && !dims) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = dv.getUint16(i + 2);
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
      dims = { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
    } else if (m === 0xe1 && dv.getUint32(i + 4) === 0x45786966) orient = exifOrientation(dv, i + 10, i + 2 + len);
    i += 2 + len;
  }
  if (!dims) return null;
  return orient >= 5 ? { width: dims.height, height: dims.width } : dims;
}

function exifOrientation(dv: DataView, t: number, end: number): number {
  if (t + 8 > dv.byteLength) return 1;
  const le = dv.getUint16(t) === 0x4949;
  const n = dv.getUint16(t + dv.getUint32(t + 4, le), le);
  for (let k = 0; k < n; k++) {
    const e = t + dv.getUint32(t + 4, le) + 2 + k * 12;
    if (e + 10 > end || e + 10 > dv.byteLength) break;
    if (dv.getUint16(e, le) === 0x0112) return dv.getUint16(e + 8, le);
  }
  return 1;
}

// Target decode size, or null when the image is already small enough.
export function decodeSize(info: ImageInfo | null): { width: number; height: number } | null {
  if (!info) return null;
  const f = fitSize(info.width, info.height, MAX_DECODE_SIDE);
  return f.width === info.width && f.height === info.height ? null : f;
}
