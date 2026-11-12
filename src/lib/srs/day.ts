// Timezone-safe "day": the user's LOCAL calendar date as YYYY-MM-DD.
// Day arithmetic goes through UTC dates so DST changes never skip or repeat a day.

export type DayKey = string;

export function dayKey(ts: number = Date.now()): DayKey {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function toUtcDays(key: DayKey): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

export const daysBetween = (a: DayKey, b: DayKey) => toUtcDays(b) - toUtcDays(a);

/** End of the user's local day (start of tomorrow) as a timestamp. */
export function endOfLocalDay(ts: number = Date.now()): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}
