import type { ScanItem } from './ResultCard';

// Remaining crops survive the trip to the Ask screen and back (per browser tab session).
const KEY = 'solvernq.scanQueue';

export function loadQueue(): ScanItem[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as ScanItem[]) : [];
    return list.filter(x => x && typeof x.id === 'string' && typeof x.text === 'string' && typeof x.dataUrl === 'string')
      .map(x => ({ ...x, busy: false }));
  } catch { return []; }
}

export function saveQueue(items: ScanItem[]): void {
  try {
    const done = items.filter(x => !x.busy);
    if (done.length) sessionStorage.setItem(KEY, JSON.stringify(done));
    else sessionStorage.removeItem(KEY);
  } catch { /* storage full or blocked: the queue just won't be kept */ }
}
