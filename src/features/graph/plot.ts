// Pure plotting logic: parsing, view maths, sampling, zeros and intersections. No React here.
import { parseExpr, freeSymbols, toFn } from '@/lib/verify/mathEnv';

export interface View { cx: number; cy: number; scale: number } // scale = pixels per unit
export type Fn = (x: number) => number;
export interface Mark { x: number; y: number; kind: 'zero' | 'cross' }

export const COLORS = [1, 2, 3, 4, 5].map((n) => `rgb(var(--g${n}))`);
/** Dash patterns so lines differ by more than colour. */
export const DASHES = ['', '9 5', '2 5', '10 4 2 4', '1 6'];
export const DEFAULT_VIEW: View = { cx: 0, cy: 0, scale: 40 };

/** Parse "x^2", "y = sin(x)" or "f(x) = x/2". Returns an error message instead of throwing. */
export function compileFn(text: string): { fn: Fn } | { error: string } {
  const body = text.replace(/^\s*(?:f\(x\)|y)\s*=\s*/i, '').replace(/\u2212/g, '-').trim();
  if (!body) return { error: 'Type a function of x' };
  if (/\blog\b/i.test(body)) return { error: 'Use ln(x) or log10(x)' };
  const node = parseExpr(body);
  if (!node) return { error: "Can't read that - try x^2, sin(x), 1/x" };
  const vars = freeSymbols(node);
  if ([...vars].some((v) => v !== 'x')) return { error: 'Only the variable x is supported' };
  return { fn: toFn(node, 'x') as Fn };
}

export function viewBounds(v: View, w: number, h: number) {
  return { xmin: v.cx - w / 2 / v.scale, xmax: v.cx + w / 2 / v.scale,
    ymin: v.cy - h / 2 / v.scale, ymax: v.cy + h / 2 / v.scale };
}

/** Grid spacing in world units that lands about 60-120px apart. */
export function niceStep(scale: number): number {
  const raw = 80 / scale;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

/** Zoom keeping the world point under screen (px, py) fixed. */
export function zoomAt(v: View, factor: number, px: number, py: number, w: number, h: number): View {
  const scale = Math.min(5000, Math.max(1.5, v.scale * factor));
  const wx = v.cx + (px - w / 2) / v.scale, wy = v.cy - (py - h / 2) / v.scale;
  return { scale, cx: wx - (px - w / 2) / scale, cy: wy + (py - h / 2) / scale };
}

/** Screen-space polylines; the line is broken at undefined values and at poles like 1/x at 0. */
export function samplePath(f: Fn, v: View, w: number, h: number): Array<Array<[number, number]>> {
  const out: Array<Array<[number, number]>> = [];
  let cur: Array<[number, number]> = [];
  let prevY = NaN;
  const flush = () => { if (cur.length > 1) out.push(cur); cur = []; };
  for (let px = 0; px <= w; px += 1.5) {
    const x = v.cx + (px - w / 2) / v.scale;
    const y = f(x);
    if (!Number.isFinite(y) || Math.abs(y - v.cy) * v.scale > h * 20) { flush(); prevY = NaN; continue; }
    const sy = h / 2 - (y - v.cy) * v.scale;
    if (Number.isFinite(prevY) && Math.abs(sy - prevY) > h * 1.5 && (sy - h / 2) * (prevY - h / 2) < 0) flush();
    cur.push([px, sy]);
    prevY = sy;
  }
  flush();
  return out;
}

/** Roots of f in [lo, hi] by sign change + bisection; poles are rejected. */
export function findZeros(f: Fn, lo: number, hi: number, n = 600): number[] {
  const roots: number[] = [];
  const step = (hi - lo) / n;
  let px = lo, pv = f(lo);
  for (let i = 1; i <= n; i++) {
    const x = lo + i * step, v = f(x);
    if (v === 0 && Number.isFinite(v)) roots.push(x);
    else if (Number.isFinite(v) && Number.isFinite(pv) && pv * v < 0) {
      let a = px, b = x;
      for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
      const m = (a + b) / 2;
      if (Math.abs(f(m)) <= 1e-6 * Math.min(Math.abs(pv), Math.abs(v)) + 1e-9) roots.push(m);
    }
    px = x; pv = v;
  }
  return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > step * 1e-3);
}

/** Zeros of each function, and crossings between each pair, inside the visible x range. */
export function findMarks(fns: Fn[], xmin: number, xmax: number): Mark[] {
  const marks: Mark[] = [];
  fns.forEach((f, i) => {
    findZeros(f, xmin, xmax).forEach((x) => marks.push({ x, y: 0, kind: 'zero' }));
    for (let j = i + 1; j < fns.length; j++) {
      const g = fns[j];
      findZeros((x) => f(x) - g(x), xmin, xmax).forEach((x) => marks.push({ x, y: f(x), kind: 'cross' }));
    }
  });
  return marks.slice(0, 40);
}

export function formatTick(n: number): string {
  if (Math.abs(n) < 1e-12) return '0';
  return Math.abs(n) >= 1e6 || Math.abs(n) < 1e-3 ? n.toExponential(0) : String(+n.toPrecision(6));
}
