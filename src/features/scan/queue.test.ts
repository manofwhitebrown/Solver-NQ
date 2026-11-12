import { beforeEach, describe, expect, it } from 'vitest';
import { loadQueue, saveQueue } from './queue';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  (globalThis as { sessionStorage?: unknown }).sessionStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});
const item = (id: string, busy = false) => ({ id, dataUrl: 'data:image/jpeg;base64,AA', text: 'x', confidence: 90, busy });

describe('scan queue', () => {
  it('round-trips finished items and drops busy ones', () => {
    saveQueue([item('a'), item('b', true)]);
    expect(loadQueue().map(x => x.id)).toEqual(['a']);
  });
  it('clears storage when empty', () => {
    saveQueue([item('a')]); saveQueue([]);
    expect(loadQueue()).toEqual([]);
  });
  it('ignores corrupt data', () => {
    store.set('solvernq.scanQueue', '{nope');
    expect(loadQueue()).toEqual([]);
  });
});
