import { describe, expect, it } from 'vitest';
import { onSharedImage, takeSharedImage } from './shareTarget';

describe('shareTarget on the web (no native plugin)', () => {
  it('returns null instead of throwing', async () => {
    expect(await takeSharedImage()).toBeNull();
  });
  it('subscribing and unsubscribing is safe', () => {
    const off = onSharedImage(() => {});
    expect(() => off()).not.toThrow();
  });
});
