export * from './store';
export * from './images';
export * from './notes';
export * from './kv';
export { exportBackup, importBackup, type ImportResult } from './backup';
export { parseBackup, BACKUP_VERSION } from './validate';
export { db } from './db';
export { ensureIndex } from './search';

/** Ask the browser not to evict our data. Safe to call repeatedly; returns the result. */
export async function requestPersistence(): Promise<boolean> {
  try { return (await navigator.storage?.persist?.()) ?? false; } catch { return false; }
}

export async function storageUsage(): Promise<{ used: number; quota: number } | undefined> {
  try {
    const e = await navigator.storage?.estimate?.();
    return e ? { used: e.usage ?? 0, quota: e.quota ?? 0 } : undefined;
  } catch { return undefined; }
}
