import { Chip } from '@/components/ui';
import type { Filters } from './useLibrary';
import { SUBJECTS } from './subjects';

interface Props {
  filters: Filters; tags: Array<{ tag: string; count: number }>;
  onChange: (f: Filters) => void; onManageTags: () => void;
}

const scroller = '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [&>*]:shrink-0';

export function FilterBar({ filters, tags, onChange, onManageTags }: Props) {
  return (
    <div className="space-y-2">
      <div className={scroller} role="group" aria-label="Subject">
        <Chip selected={!filters.subject} onClick={() => onChange({ ...filters, subject: undefined })}>All</Chip>
        {SUBJECTS.map(s => (
          <Chip key={s.id} selected={filters.subject === s.id}
            onClick={() => onChange({ ...filters, subject: filters.subject === s.id ? undefined : s.id })}>{s.label}</Chip>
        ))}
      </div>
      <div className={scroller} role="group" aria-label="Tags">
        <Chip selected={!!filters.starred} onClick={() => onChange({ ...filters, starred: !filters.starred })}>★ Starred</Chip>
        {tags.map(t => (
          <Chip key={t.tag} selected={filters.tag === t.tag}
            onClick={() => onChange({ ...filters, tag: filters.tag === t.tag ? undefined : t.tag })}>#{t.tag} · {t.count}</Chip>
        ))}
        {tags.length > 0 && <Chip onClick={onManageTags}>Edit tags</Chip>}
      </div>
    </div>
  );
}
