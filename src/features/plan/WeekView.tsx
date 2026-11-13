import { cn } from '@/components/ui';
import { weekdayName, type PlanDay } from '@/lib/plan';

/** Seven day buttons (44 px or taller). Tap one to see that day's tasks below. If the screen is too narrow
 *  the strip scrolls inside itself, never the page. The selected day uses the brand gradient. */
export function WeekView({ days, selected, onSelect, doneIds, today }: {
  days: PlanDay[]; selected: string; onSelect: (day: string) => void; doneIds: string[]; today?: string;
}) {
  return (
    <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(44px,1fr)] gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
      role="group" aria-label="This week">
      {days.slice(0, 7).map((d) => {
        const real = d.tasks.filter((t) => t.kind !== 'rest');
        const all = real.length > 0 && real.every((t) => doneIds.includes(t.id));
        const on = selected === d.day;
        return (
          <button key={d.day} type="button" onClick={() => onSelect(d.day)} aria-pressed={on} aria-current={d.day === today ? 'date' : undefined}
            className={cn('flex min-h-[4.5rem] snap-start flex-col items-center justify-center gap-0.5 rounded-lg border py-2 text-sm transition active:scale-95 motion-reduce:transition-none',
              on ? 'brand-grad border-transparent text-white'
                : d.day === today ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-raised text-ink-2')}>
            <span className="text-caption">{weekdayName(d.day)}</span>
            <span className="text-lg font-bold leading-tight">{Number(d.day.slice(8))}</span>
            <span aria-hidden className="text-caption leading-none">
              {d.exams.length ? '🎯' : all ? '✓' : d.off ? '–' : d.restDay ? '🌙' : `${d.minutes}m`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
