import { dayKey, daysBetween, type DayKey } from '@/lib/srs/day';

export { dayKey, daysBetween };

const toUtc = (k: DayKey) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };

export function addDays(k: DayKey, n: number): DayKey {
  const d = new Date(toUtc(k) + n * 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
export const weekday = (k: DayKey): number => new Date(toUtc(k)).getUTCDay();
export const isDayKey = (s: unknown): s is DayKey => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const weekdayName = (k: DayKey) => WD[weekday(k)];
export const shortDate = (k: DayKey) => `${WD[weekday(k)]} ${Number(k.slice(8))}/${Number(k.slice(5, 7))}`;
