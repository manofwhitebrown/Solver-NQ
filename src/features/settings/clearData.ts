import { resetSettings } from '@/lib/settings';

/** Wipes settings, every IndexedDB database and cached files, then reloads. */
export async function clearAllData(): Promise<void> {
  resetSettings();
  try {
    const dbs = (await indexedDB.databases?.()) ?? [];
    await Promise.all(
      dbs.map((d) => new Promise<void>((resolve) => {
        if (!d.name) return resolve();
        const req = indexedDB.deleteDatabase(d.name);
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      })),
    );
  } catch { /* keep going */ }
  try {
    for (const k of await caches.keys()) await caches.delete(k);
  } catch { /* caches may be unavailable */ }
  try { sessionStorage.clear(); } catch { /* ignore */ }
  location.reload();
}
