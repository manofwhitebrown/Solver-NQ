import { describe, expect, it } from 'vitest';
import { normalizeDisplayMath } from './mathBlocks';

describe('normalizeDisplayMath', () => {
  it('turns a one-line $$ block into a multi-line block', () => {
    expect(normalizeDisplayMath('a\n\n$$x = 1$$\n\nb')).toBe('a\n\n$$\nx = 1\n$$\n\nb');
  });
  it('leaves inline math and existing blocks alone', () => {
    expect(normalizeDisplayMath('so $x$ and $$y$$ inline')).toBe('so $x$ and $$y$$ inline');
    expect(normalizeDisplayMath('$$\nx\n$$')).toBe('$$\nx\n$$');
  });
});
