import { cn } from '@/components/ui';
import { weekdayName, type PlanDay } from '@/lib/plan';

/** Seven day buttons. Tap one to see that day's tasks below. */
export function WeekView({ days, selected, onSelect, doneIds }: {
  days: PlanDay[]; selected: string; onSelect: (day: string) => void; doneIds: string[];
}) {
  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2" role="group" aria-label="This week">
      {days.slice(0, 7).map((d) => {
        const real = d.tasks.filter((t) => t.kind !== 'rest');
        const all = real.length > 0 && real.every((t) => doneIds.includes(t.id));
        return (
          <button key={d.day} type="button" onClick={() => onSelect(d.day)} aria-pressed={selected === d.day}
            className={cn('flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border py-2 text-sm transition',
              selected === d.day ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-raised text-ink-2')}>
            <span className="text-caption">{weekdayName(d.day)}</span>
            <span className="font-semibold">{Number(d.day.slice(8))}</span>
            <span aria-hidden className="text-caption leading-none">
              {d.exams.length ? '🎯' : all ? '✓' : d.off ? '–' : d.restDay ? '🌙' : `${d.minutes}m`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
