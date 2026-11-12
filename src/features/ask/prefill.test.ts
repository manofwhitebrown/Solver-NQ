import { describe, expect, it } from 'vitest';
import { readPrefill } from './prefill';

describe('readPrefill', () => {
  it('reads text and a valid subject', () => {
    expect(readPrefill(new URLSearchParams('text=Solve%203x%2B4%3D19&subject=math'))).toEqual({ text: 'Solve 3x+4=19', subject: 'math' });
  });
  it('ignores an unknown subject', () => {
    expect(readPrefill(new URLSearchParams('text=hi&subject=evil'))?.subject).toBeUndefined();
  });
  it('returns null without text', () => {
    expect(readPrefill(new URLSearchParams(''))).toBeNull();
    expect(readPrefill(new URLSearchParams('text=%20%20'))).toBeNull();
  });
  it('caps very long text', () => {
    expect(readPrefill(new URLSearchParams('text=' + 'a'.repeat(9000)))?.text.length).toBe(4000);
  });
});
