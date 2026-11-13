import { Chip } from '@/components/ui';
import type { Subject } from '@/types';
import { SUBJECTS } from './subjects';

/** One-tap subject filter. Scrolls sideways inside its own box, so the page itself never scrolls sideways. */
export function SubjectRail({ value, onChange }: { value?: Subject; onChange: (s?: Subject) => void }) {
  return (
    <div role="group" aria-label="Filter by subject" className="-mx-5 flex scroll-px-5 snap-x gap-2 overflow-x-auto px-5 py-2 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
      <Chip selected={!value} className="min-h-[44px] shrink-0 snap-start" onClick={() => onChange(undefined)}>All</Chip>
      {SUBJECTS.map(s => (
        <Chip key={s.id} selected={value === s.id} className="min-h-[44px] shrink-0 snap-start" onClick={() => onChange(value === s.id ? undefined : s.id)}>{s.label}</Chip>
      ))}
    </div>
  );
}
