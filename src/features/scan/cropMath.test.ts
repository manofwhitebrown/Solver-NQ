import { describe, expect, it } from 'vitest';
import { clampRect, dragRect, toPixels } from './cropMath';

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
