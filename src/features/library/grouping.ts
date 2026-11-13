import type { LibraryItem } from '@/lib/db';

export interface DayGroup { label: string; items: LibraryItem[] }

const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

/** Labels for a newest-first list: Today, Yesterday, This week, then one group per month. */
export function groupByDay(items: LibraryItem[], now = Date.now()): DayGroup[] {
  const today = startOfDay(now); const day = 86_400_000;
  const groups: DayGroup[] = [];
  for (const it of items) {
    const t = it.q.createdAt; const s = startOfDay(t);
    const label = s >= today ? 'Today' : s >= today - day ? 'Yesterday' : s >= today - 6 * day ? 'This week'
      : new Date(t).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(it); else groups.push({ label, items: [it] });
  }
  return groups;
}

export function libraryStats(items: LibraryItem[], now = Date.now()) {
  const week = startOfDay(now) - 6 * 86_400_000;
  return { total: items.length, starred: items.filter(i => i.q.starred).length, thisWeek: items.filter(i => i.q.createdAt >= week).length };
}
