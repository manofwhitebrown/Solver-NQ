import { describe, it, expect } from 'vitest';
import { compileFn, niceStep, zoomAt, samplePath, findZeros, findMarks, DEFAULT_VIEW, type Fn } from './plot';

const fn = (t: string): Fn => { const r = compileFn(t); if (!('fn' in r)) throw new Error(r.error); return r.fn; };

describe('compileFn', () => {
  it('parses functions with optional prefix', () => {
    expect(fn('x^2')(3)).toBe(9);
    expect(fn('y = 2x + 1')(2)).toBe(5);
    expect(fn('f(x) = sin(pi/2 * x)')(1)).toBeCloseTo(1);
  });
  it('gives friendly errors', () => {
    expect(compileFn('')).toHaveProperty('error');
    expect(compileFn('x + y')).toHaveProperty('error');
    expect(compileFn('log(x)')).toHaveProperty('error');
    expect(compileFn('evaluate(1)')).toHaveProperty('error');
    expect(compileFn('x +* 2')).toHaveProperty('error');
  });
  it('returns NaN where undefined', () => {
    expect(fn('sqrt(x)')(-1)).toBeNaN();
    expect(fn('ln(x)')(-1)).toBeNaN();
  });
});

describe('view maths', () => {
  it('picks 1-2-5 grid steps', () => {
    expect(niceStep(40)).toBe(2);
    expect(niceStep(400)).toBe(0.2);
    expect(niceStep(4)).toBe(20);
  });
  it('zooms around the pointer', () => {
    const v = zoomAt(DEFAULT_VIEW, 2, 300, 100, 400, 300);
    const before = (300 - 200) / DEFAULT_VIEW.scale;
    const after = v.cx + (300 - 200) / v.scale;
    expect(after).toBeCloseTo(before);
  });
});

describe('sampling', () => {
  it('breaks the line at a pole', () => {
    expect(samplePath(fn('1/x'), DEFAULT_VIEW, 400, 300).length).toBe(2);
  });
  it('keeps a smooth curve in one piece', () => {
    expect(samplePath(fn('x^2'), DEFAULT_VIEW, 400, 300).length).toBe(1);
  });
});

describe('zeros and crossings', () => {
  it('finds both roots of x^2 - 4', () => {
    const z = findZeros(fn('x^2 - 4'), -10, 10).map((r) => +r.toFixed(6));
    expect(z).toEqual([-2, 2]);
  });
  it('does not report a pole as a zero', () => {
    expect(findZeros(fn('1/x'), -5, 5)).toEqual([]);
  });
  it('finds intersections between two functions', () => {
    const m = findMarks([fn('x'), fn('x^2')], -5, 5).filter((k) => k.kind === 'cross');
    expect(m.map((k) => +k.x.toFixed(5)).sort()).toEqual([0, 1]);
  });
});
