import { BookOpen, CalendarDays, Star } from 'lucide-react';

interface Props { total: number; starred: number; thisWeek: number }

/** Three small tiles above the list: how much is saved, starred, and added in the last 7 days. */
export function LibraryStats({ total, starred, thisWeek }: Props) {
  const tiles = [
    { label: 'Saved', value: total, Icon: BookOpen }, { label: 'Starred', value: starred, Icon: Star },
    { label: 'This week', value: thisWeek, Icon: CalendarDays },
  ];
  return (
    <ul className="grid grid-cols-3 gap-3" aria-label="Library summary">
      {tiles.map(({ label, value, Icon }) => (
        <li key={label} className="elev-1 flex flex-col gap-1 rounded-xl p-3 lg:p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent"><Icon size={16} strokeWidth={2} aria-hidden /></span>
          <span className="text-2xl font-extrabold leading-none tracking-tight text-ink">{value}</span>
          <span className="text-caption font-semibold text-muted">{label}</span>
        </li>
      ))}
    </ul>
  );
}
