import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

function block(selector: string): Record<string, number[]> {
  const i = css.indexOf(selector + ' {');
  const body = css.slice(i, css.indexOf('}', i));
  const out: Record<string, number[]> = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(\d+) (\d+) (\d+)/g)) out[m[1]] = [+m[2], +m[3], +m[4]];
  return out;
}
const lum = ([r, g, b]: number[]) => {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const themes = { light: block(':root'), dark: block(":root[data-theme='dark']") };

describe.each(Object.entries(themes))('%s theme contrast', (_n, t) => {
  const surfaces = ['bg', 'surface', 'raised'];
  it('text >= 4.5:1 on bg, surface, raised', () => {
    for (const s of surfaces) for (const k of ['ink', 'ink-2', 'muted', 'accent', 'ok', 'warn', 'bad']) {
      expect(ratio(t[k], t[s]), `${k} on ${s}`).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('overlay text >= 4.5:1', () => {
    for (const k of ['ink', 'ink-2', 'muted', 'accent']) expect(ratio(t[k], t.overlay), k).toBeGreaterThanOrEqual(4.5);
  });
  it('control borders (line-strong) >= 3:1 on all surfaces', () => {
    for (const s of [...surfaces, 'overlay']) expect(ratio(t['line-strong'], t[s]), s).toBeGreaterThanOrEqual(3);
  });
  it('accent-ink on accent and accent text on accent-soft >= 4.5:1', () => {
    expect(ratio(t['accent-ink'], t.accent)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t.accent, t['accent-soft'])).toBeGreaterThanOrEqual(4.5);
  });
  it('semantic text on its soft badge background >= 4.5:1', () => {
    for (const k of ['ok', 'warn', 'bad']) expect(ratio(t[k], t[`${k}-soft`]), k).toBeGreaterThanOrEqual(4.5);
  });
  it('disabled controls look clearly different from enabled ones', () => {
    expect(ratio(t['disabled-bg'], t.accent)).toBeGreaterThanOrEqual(2);
    expect(ratio(t['disabled-ink'], t['disabled-bg'])).toBeLessThan(ratio(t['accent-ink'], t.accent));
    expect(ratio(t['disabled-bg'], t.surface)).toBeLessThan(1.5);
  });
  it('layers are separated: surface vs bg differs (border + shadow carry the rest)', () => {
    expect(ratio(t.surface, t.bg)).toBeGreaterThan(1.05);
    expect(ratio(t.line, t.surface)).toBeGreaterThan(1.05);
  });
});
