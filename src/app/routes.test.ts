import { describe, expect, it } from 'vitest';
import { routes } from './routes';

describe('app routes', () => {
  const children = routes[0].children ?? [];
  const paths = children.map((r) => (r.index ? '' : (r.path ?? '').replace(/^\//, '')));

  it('covers every main tab', () => {
    for (const p of ['', 'library', 'learn', 'settings']) expect(paths).toContain(p);
  });
  it('ends with a catch-all 404', () => {
    expect(paths[paths.length - 1]).toBe('*');
  });
});

describe('placeholders', () => {
  it('never duplicate a path a feature already owns', () => {
    const kids = routes[0].children ?? [];
    const norm = kids.filter((r) => !r.index).map((r) => (r.path ?? '').replace(/^\//, ''));
    expect(new Set(norm).size).toBe(norm.length);
  });
});
