import { describe, expect, it } from 'vitest';
import { isLowConfidence, LOW_CONFIDENCE } from './confidence';
import { enhancePixels, fitSize, otsu } from './preprocess';

describe('fitSize', () => {
  it('downscales the long side to maxSide, keeping the ratio', () => {
    expect(fitSize(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
  });
  it('never upscales', () => {
    expect(fitSize(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});

describe('enhancePixels', () => {
  const px = (...v: number[]) => new Uint8ClampedArray(v.flatMap(g => [g, g, g, 255]));

  it('converts to grayscale', () => {
    const d = new Uint8ClampedArray([255, 0, 0, 255]);
    enhancePixels(d, 1, false);
    expect(d[0]).toBe(d[1]); expect(d[1]).toBe(d[2]);
  });
  it('boosts contrast around mid-grey', () => {
    const d = px(100, 160);
    enhancePixels(d, 2, false);
    expect(d[0]).toBeLessThan(100); expect(d[4]).toBeGreaterThan(160);
  });
  it('threshold gives only black or white', () => {
    const d = px(20, 30, 220, 230);
    enhancePixels(d, 1, true);
    expect([d[0], d[4], d[8], d[12]]).toEqual([0, 0, 255, 255]);
  });
});

describe('otsu', () => {
  it('splits a two-tone histogram between the peaks', () => {
    const h = new Array(256).fill(0);
    h[40] = 50; h[200] = 50;
    const t = otsu(h, 100);
    expect(t).toBeGreaterThanOrEqual(40); expect(t).toBeLessThan(200);
  });
});

describe('confidence', () => {
  it('flags values below the threshold', () => {
    expect(isLowConfidence(LOW_CONFIDENCE - 1)).toBe(true);
    expect(isLowConfidence(LOW_CONFIDENCE)).toBe(false);
  });
});
