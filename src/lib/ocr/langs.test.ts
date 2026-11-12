import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { codeFromKey, deleteCachedPack, formatBytes, keyFor, listCachedPacks } from './langs';

describe('language packs', () => {
  it('maps cache keys to codes', () => {
    expect(codeFromKey(keyFor('hin'))).toBe('hin');
    expect(codeFromKey('./x.txt')).toBeNull();
    expect(codeFromKey(5)).toBeNull();
  });
  it('formats sizes', () => {
    expect(formatBytes(900)).toBe('900 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(4.5 * 1024 * 1024)).toBe('4.5 MB');
  });
  it('lists and deletes cached packs', async () => {
    expect(await listCachedPacks()).toEqual([]);
    await new Promise<void>((ok, no) => {
      const r = indexedDB.open('keyval-store');
      r.onupgradeneeded = () => r.result.createObjectStore('keyval');
      r.onsuccess = () => {
        const tx = r.result.transaction('keyval', 'readwrite');
        tx.objectStore('keyval').put(new Uint8Array(1000), keyFor('hin'));
        tx.objectStore('keyval').put(new Uint8Array(5), 'other');
        tx.oncomplete = () => { r.result.close(); ok(); };
        tx.onerror = () => no(tx.error);
      };
    });
    expect(await listCachedPacks()).toEqual([{ code: 'hin', bytes: 1000 }]);
    await deleteCachedPack('hin');
    expect(await listCachedPacks()).toEqual([]);
  });
});
