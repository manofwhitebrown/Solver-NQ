// Pure crop-rectangle helpers (normalised 0..1 coordinates), easy to unit test.
export interface Rect { x: number; y: number; w: number; h: number }
const MIN = 0.05;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function clampRect(r: Rect): Rect {
  const w = clamp(r.w, MIN, 1), h = clamp(r.h, MIN, 1);
  return { x: clamp(r.x, 0, 1 - w), y: clamp(r.y, 0, 1 - h), w, h };
}

export type Handle = 'nw' | 'ne' | 'sw' | 'se' | 'move';

export function dragRect(r: Rect, handle: Handle, dx: number, dy: number): Rect {
  if (handle === 'move') return clampRect({ ...r, x: r.x + dx, y: r.y + dy });
  let { x, y, w, h } = r;
  if (handle.includes('w')) { x += dx; w -= dx; } else w += dx;
  if (handle.includes('n')) { y += dy; h -= dy; } else h += dy;
  return clampRect({ x, y, w, h });
}

export function toPixels(r: Rect, width: number, height: number) {
  return { sx: Math.round(r.x * width), sy: Math.round(r.y * height),
           sw: Math.max(1, Math.round(r.w * width)), sh: Math.max(1, Math.round(r.h * height)) };
}
