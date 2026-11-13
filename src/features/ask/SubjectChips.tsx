import { Chip } from '@/components/ui';
import { SUBJECTS } from '@/features/settings/options';
import type { Subject } from '@/types';

/** One scrollable row: snaps to each chip, fades at the right edge so it is clear there is more (the left edge stays clear so the selected chip is never washed out). */
export function SubjectChips({ value, onChange }: { value: Subject; onChange: (s: Subject) => void }) {
  return (
    <div role="group" aria-label="Subject"
      className="-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 py-1 md:-mx-7 md:px-7 lg:-mx-10 lg:px-10 scroll-pl-5 md:scroll-pl-7 lg:scroll-pl-10 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] [scrollbar-width:none]">
      {SUBJECTS.map(s => (
        <Chip key={s.value} selected={s.value === value} onClick={() => onChange(s.value)} className="min-h-[44px] shrink-0 snap-start">
          {s.label}
        </Chip>
      ))}
    </div>
  );
}
