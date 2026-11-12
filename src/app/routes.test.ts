import { describe, expect, it } from 'vitest';
import { routes } from './routes';

describe('app routes', () => {
  const children = routes[0].children ?? [];
  const paths = children.map((r) => (r.index ? '/' : r.path));

  it('covers every main tab', () => {
    for (const p of ['/', 'library', 'learn', 'settings']) expect(paths).toContain(p);
  });
  it('ends with a catch-all 404', () => {
    expect(paths[paths.length - 1]).toBe('*');
  });
});
