import { Chip, Cluster } from '@/components/ui';
import type { Filters } from './useLibrary';
import { subjectLabel } from './subjects';

/** Selected filters as removable chips that wrap onto more lines (never a clipped scroller). */
export function FilterChips({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const chips: Array<{ key: string; label: string; clear: Partial<Filters> }> = [];
  if (filters.subject) chips.push({ key: 'subject', label: subjectLabel(filters.subject), clear: { subject: undefined } });
  if (filters.starred) chips.push({ key: 'starred', label: '★ Starred', clear: { starred: undefined } });
  if (filters.tag) chips.push({ key: 'tag', label: `#${filters.tag}`, clear: { tag: undefined } });
  if (!chips.length) return null;
  return (
    <Cluster gap={2} aria-label="Active filters">
      {chips.map(c => (
        <Chip key={c.key} selected aria-label={`Remove filter ${c.label}`} onClick={() => onChange({ ...filters, ...c.clear })}>{c.label} ✕</Chip>
      ))}
    </Cluster>
  );
}
