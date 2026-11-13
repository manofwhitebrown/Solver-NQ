import { describe, expect, it } from 'vitest';
import { clampRect, DEFAULT_CROP, dragRect, toPixels } from './cropMath';
import { fitSize } from '@/lib/ocr/preprocess';

describe('cropMath', () => {
  it('clamps a rect inside the image and enforces a minimum size', () => {
    expect(clampRect({ x: -0.2, y: 0.9, w: 0.5, h: 0.5 })).toEqual({ x: 0, y: 0.5, w: 0.5, h: 0.5 });
    expect(clampRect({ x: 0.5, y: 0.5, w: 0, h: 0 }).w).toBeGreaterThanOrEqual(0.05);
  });

  it('moves without leaving the image', () => {
    const r = dragRect({ x: 0.1, y: 0.1, w: 0.5, h: 0.5 }, 'move', 5, -5);
    expect(r).toEqual({ x: 0.5, y: 0, w: 0.5, h: 0.5 });
  });

  it('resizes from the south-east and north-west corners', () => {
    const base = { x: 0.2, y: 0.2, w: 0.4, h: 0.4 };
    const se = dragRect(base, 'se', 0.1, 0.2);
    expect(se.w).toBeCloseTo(0.5); expect(se.h).toBeCloseTo(0.6);
    const nw = dragRect(base, 'nw', 0.1, 0.1);
    expect(nw.x).toBeCloseTo(0.3); expect(nw.w).toBeCloseTo(0.3);
  });

  it('never shrinks below the minimum', () => {
    const r = dragRect({ x: 0.2, y: 0.2, w: 0.1, h: 0.1 }, 'se', -1, -1);
    expect(r.w).toBe(0.05); expect(r.h).toBe(0.05);
  });

  it('converts to pixels with at least 1px', () => {
    expect(toPixels({ x: 0.25, y: 0.5, w: 0.5, h: 0.25 }, 200, 100)).toEqual({ sx: 50, sy: 50, sw: 100, sh: 25 });
    expect(toPixels({ x: 0, y: 0, w: 0.0001, h: 0.0001 }, 10, 10).sw).toBe(1);
  });
});

describe('default crop (B1: a tight photo is read completely)', () => {
  // Tight photos: text right up to every edge, so any inset would cut the first or last letter.
  const sizes: [number, number][] = [[1000, 120], [3000, 200], [4032, 3024], [641, 77], [1, 1], [120, 1000]];

  it('is the whole image', () => {
    expect(DEFAULT_CROP).toEqual({ x: 0, y: 0, w: 1, h: 1 });
    expect(clampRect(DEFAULT_CROP)).toEqual(DEFAULT_CROP);
  });
  it.each(sizes)('covers every pixel of a %i x %i photo', (w, h) => {
    expect(toPixels(DEFAULT_CROP, w, h)).toEqual({ sx: 0, sy: 0, sw: w, sh: h });
  });
  it('keeps the first and last column and row after the 1600 px downscale used before OCR/AI', () => {
    for (const [w, h] of sizes) {
      const { sw, sh } = toPixels(DEFAULT_CROP, w, h);
      const out = fitSize(sw, sh, 1600);
      expect(out.width / out.height).toBeCloseTo(w / h, 0); // same shape, nothing trimmed
      expect(out.width).toBeGreaterThanOrEqual(1);
      expect(out.height).toBeGreaterThanOrEqual(1);
    }
  });
  it('touching a handle without moving it does not shrink the box', () => {
    for (const hd of ['nw', 'ne', 'sw', 'se', 'move'] as const) expect(dragRect(DEFAULT_CROP, hd, 0, 0)).toEqual(DEFAULT_CROP);
  });
});
