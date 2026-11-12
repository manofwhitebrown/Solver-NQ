import { describe, expect, it } from 'vitest';
import { decodeSize, MAX_DECODE_SIDE, parseImageInfo } from './imageSize';

function png(w: number, h: number) {
  const b = new Uint8Array(33); b.set([0x89, 0x50, 0x4e, 0x47]);
  const dv = new DataView(b.buffer); dv.setUint32(16, w); dv.setUint32(20, h);
  return b;
}
function jpeg(w: number, h: number, orient?: number) {
  const parts: number[] = [0xff, 0xd8];
  if (orient) {
    // APP1 Exif, little-endian TIFF, one IFD entry 0x0112
    const t = [0x49, 0x49, 0x2a, 0, 8, 0, 0, 0, 1, 0, 0x12, 0x01, 3, 0, 1, 0, 0, 0, orient, 0, 0, 0, 0, 0, 0, 0];
    const body = [0x45, 0x78, 0x69, 0x66, 0, 0, ...t];
    parts.push(0xff, 0xe1, (body.length + 2) >> 8, (body.length + 2) & 255, ...body);
  }
  parts.push(0xff, 0xc0, 0, 11, 8, h >> 8, h & 255, w >> 8, w & 255, 3, 0, 0, 0);
  return new Uint8Array(parts);
}

describe('parseImageInfo', () => {
  it('reads PNG size', () => expect(parseImageInfo(png(4000, 3000))).toEqual({ width: 4000, height: 3000 }));
  it('reads JPEG size', () => expect(parseImageInfo(jpeg(4000, 3000))).toEqual({ width: 4000, height: 3000 }));
  it('swaps width and height for rotated EXIF photos', () =>
    expect(parseImageInfo(jpeg(4000, 3000, 6))).toEqual({ width: 3000, height: 4000 }));
  it('returns null for unknown data', () => expect(parseImageInfo(new Uint8Array([1, 2, 3]))).toBeNull());
});

describe('decodeSize', () => {
  it('downsizes a 48 MP photo to the cap, keeping the ratio', () => {
    const r = decodeSize({ width: 8000, height: 6000 })!;
    expect(Math.max(r.width, r.height)).toBe(MAX_DECODE_SIDE);
    expect(r).toEqual({ width: 2400, height: 1800 });
  });
  it('handles portrait photos', () => expect(decodeSize({ width: 3000, height: 4000 })).toEqual({ width: 1800, height: 2400 }));
  it('leaves small images alone', () => expect(decodeSize({ width: 1200, height: 900 })).toBeNull());
  it('returns null when size is unknown', () => expect(decodeSize(null)).toBeNull());
});
