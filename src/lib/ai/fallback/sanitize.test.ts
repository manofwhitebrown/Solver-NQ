import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadState, resetCache } from './store';

describe('loadState with damaged saved data', () => {
  const mem = new Map<string, string>();
  beforeEach(() => {
    mem.clear(); resetCache();
    vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); } });
  });
  it('fills missing fields instead of crashing', () => {
    mem.set('solvernq.ai.v2', JSON.stringify({ version: 1, keys: [{ id: 'k', provider: 'gemini', label: 'a', key: 'x' }], chain: [{ id: 's', provider: 'gemini', model: 'm', keyId: 'k', enabled: true }] }));
    const s = loadState();
    expect(s.cooldowns).toEqual({});
    expect(s.invalidKeys).toEqual([]);
    expect(s.keys).toHaveLength(1);
  });
  it('falls back to a fresh state for garbage', () => {
    mem.set('solvernq.ai.v2', '"nonsense"');
    expect(Array.isArray(loadState().chain)).toBe(true);
  });
});
