// Language packs for the web reader. Tesseract keeps downloaded data in IndexedDB
// (database "keyval-store", store "keyval", key "./<code>.traineddata"); we read that
// directly so people can see sizes and free space. English ships with the app.
const DB = 'keyval-store';
const STORE = 'keyval';
export const BUNDLED_LANG = 'eng';

export interface LangPack { code: string; bytes: number }

export const keyFor = (code: string) => `./${code}.traineddata`;
export const codeFromKey = (key: unknown): string | null => {
  const m = typeof key === 'string' ? /^\.\/([a-z_]+)\.traineddata$/.exec(key) : null;
  return m ? m[1] : null;
};

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise(res => {
    if (typeof indexedDB === 'undefined') return res(null);
    const r = indexedDB.open(DB);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => res(null);
  });
}

const wrap = <T,>(r: IDBRequest<T>) => new Promise<T>((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });

/** Packs Tesseract has cached on this device. */
export async function listCachedPacks(): Promise<LangPack[]> {
  const db = await openDb();
  if (!db) return [];
  try {
    const store = db.transaction(STORE).objectStore(STORE);
    const keys = await wrap(store.getAllKeys());
    const out: LangPack[] = [];
    for (const k of keys) {
      const code = codeFromKey(k);
      if (!code) continue;
      const v = await wrap(store.get(k)) as { byteLength?: number } | undefined;
      out.push({ code, bytes: v?.byteLength ?? 0 });
    }
    return out;
  } catch { return []; } finally { db.close(); }
}

export async function deleteCachedPack(code: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try { await wrap(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(keyFor(code))); } finally { db.close(); }
}
