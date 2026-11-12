import { BottomSheet, Button, Chip, Cluster, Stack } from '@/components/ui';
import type { Filters } from './useLibrary';
import { SUBJECTS } from './subjects';

interface Props {
  open: boolean; onClose: () => void; filters: Filters; tags: Array<{ tag: string; count: number }>;
  onChange: (f: Filters) => void; onManageTags: () => void;
}

const heading = 'mb-2 text-sm font-semibold text-ink-2';

/** One sheet for every filter, so the library screen stays calm. Changes apply immediately. */
export function FilterSheet({ open, onClose, filters, tags, onChange, onManageTags }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filters">
      <Stack gap={6}>
        <div>
          <h3 className={heading}>Subject</h3>
          <Cluster gap={2}>
            {SUBJECTS.map(s => (
              <Chip key={s.id} selected={filters.subject === s.id}
                onClick={() => onChange({ ...filters, subject: filters.subject === s.id ? undefined : s.id })}>{s.label}</Chip>
            ))}
          </Cluster>
        </div>
        <div>
          <h3 className={heading}>Show</h3>
          <Chip selected={!!filters.starred} onClick={() => onChange({ ...filters, starred: !filters.starred })}>★ Starred only</Chip>
        </div>
        {tags.length > 0 && (
          <div>
            <h3 className={heading}>Tags</h3>
            <Cluster gap={2}>
              {tags.map(t => (
                <Chip key={t.tag} selected={filters.tag === t.tag}
                  onClick={() => onChange({ ...filters, tag: filters.tag === t.tag ? undefined : t.tag })}>#{t.tag} · {t.count}</Chip>
              ))}
            </Cluster>
          </div>
        )}
        <Cluster gap={3}>
          <Button onClick={onClose}>Done</Button>
          <Button variant="ghost" onClick={() => onChange({})}>Clear all</Button>
          {tags.length > 0 && <Button variant="ghost" onClick={() => { onClose(); onManageTags(); }}>Edit tags</Button>}
        </Cluster>
      </Stack>
    </BottomSheet>
  );
}
