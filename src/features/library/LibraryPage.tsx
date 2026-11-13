import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button, EmptyState, Input, PageHeader, Section, Stack, cn } from '@/components/ui';
import { FilterChips } from './FilterChips';
import { FilterSheet } from './FilterSheet';
import { groupByDay, libraryStats } from './grouping';
import { LibraryStats } from './LibraryStats';
import { RowSkeletons } from './RowSkeleton';
import { SubjectRail } from './SubjectRail';
import { Row } from './Row';
import { SelectionBar } from './SelectionBar';
import { AddTagSheet, ManageTagsSheet } from './TagSheet';
import { useLibrary } from './useLibrary';

const PAGE = 40; // render in pages so thousands of items stay fast (measured, see docs/status/AI-3.md)

/** Arrow keys move between rows; Home/End jump to the first/last. */
function rowKeys(e: KeyboardEvent<HTMLElement>) {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const rows = [...e.currentTarget.querySelectorAll<HTMLElement>('[data-row]')];
  const at = rows.indexOf(document.activeElement as HTMLElement);
  if (at < 0) return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? rows.length - 1 : at + (e.key === 'ArrowDown' ? 1 : -1);
  rows[Math.max(0, Math.min(rows.length - 1, next))]?.focus();
}

export default function LibraryPage() {
  const lib = useLibrary();
  const nav = useNavigate();
  const [sheet, setSheet] = useState<'add' | 'manage' | 'filters' | null>(null);
  const [shown, setShown] = useState(PAGE);
  const selecting = lib.selectMode;

  useEffect(() => setShown(PAGE), [lib.query, lib.filters]);
  useEffect(() => {
    if (!lib.undo) return;
    const id = setTimeout(lib.dismissUndo, 8000);
    return () => clearTimeout(id);
  }, [lib.undo, lib.dismissUndo]);

  const items = lib.items;
  const active = [lib.filters.subject, lib.filters.tag, lib.filters.starred].filter(Boolean).length;
  const filtered = !!lib.query || active > 0;

  return (
    <div className={cn(selecting && 'pb-24')}>
      <PageHeader title="Library" subtitle={items ? `${items.length} ${items.length === 1 ? 'item' : 'items'}${filtered ? ' found' : ''}` : undefined}
        actions={!selecting && !!items?.length ? <Button variant="secondary" onClick={lib.startSelecting}>Select</Button> : undefined} />
      <Section>
        <Stack gap={4}>
          <div className="glass elev-1 sticky top-[calc(var(--sat)+0.5rem)] z-20 flex items-center gap-2 rounded-2xl p-2">
            <div className="relative min-w-0 flex-1">
              <Search size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <Input type="search" value={lib.query} onChange={e => lib.setQuery(e.target.value)} placeholder="Search your library"
                aria-label="Search library" className="w-full border-transparent bg-transparent pl-11 shadow-none" />
            </div>
            <Button variant="secondary" className="shrink-0 gap-2" onClick={() => setSheet('filters')} aria-label={active ? `Filters, ${active} active` : 'Filters'}>
              <SlidersHorizontal size={16} aria-hidden /><span className="hidden sm:inline">Filters</span>{active > 0 && <span className="rounded-full bg-accent px-2 text-caption text-accent-ink">{active}</span>}
            </Button>
          </div>
          <SubjectRail value={lib.filters.subject} onChange={subject => lib.setFilters({ ...lib.filters, subject })} />
          {!filtered && !!items?.length && !selecting && <LibraryStats {...libraryStats(items)} />}
          <FilterChips filters={lib.filters} onChange={lib.setFilters} />

          {items === null && <RowSkeletons />}
          {items?.length === 0 && (filtered
            ? <EmptyState title="Nothing matches" text="Try a different search, or clear the filters."
                action={<Button variant="secondary" onClick={() => { lib.setQuery(''); lib.setFilters({}); }}>Clear search and filters</Button>} />
            : <EmptyState icon={<span className="brand-grad flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-glow" aria-hidden>📚</span>} title="Your library is empty"
                text="Ask a question or scan one from your notebook. Every answer is saved here automatically, so you can find it again, even offline."
                action={<div className="flex flex-wrap justify-center gap-3">
                  <Link to="/"><Button>Ask a question</Button></Link>
                  <Link to="/scan"><Button variant="secondary">Scan</Button></Link>
                </div>} />)}
          {!!items?.length && (
            <>
              <div className="flex flex-col gap-6" onKeyDown={rowKeys}>
                {groupByDay(items.slice(0, shown)).map(g => (
                  <section key={g.label} aria-label={g.label} className="flex flex-col gap-3">
                    <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-muted">{g.label}</h2>
                    <ul className="flex flex-col gap-3">
                      {g.items.map(it => (
                        <Row key={it.q.id} item={it} selecting={selecting} selected={lib.selected.has(it.q.id)}
                          onToggle={() => lib.toggle(it.q.id)} onStar={() => void lib.toggleStar(it.q.id, !it.q.starred)} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              {shown < items.length && (
                <Button variant="secondary" className="mx-auto" onClick={() => setShown(n => n + PAGE)}>Show more ({items.length - shown})</Button>
              )}
            </>
          )}
        </Stack>
      </Section>

      {selecting && (
        <SelectionBar count={lib.selected.size} onCancel={lib.clearSelection}
          onExport={() => lib.selected.size && nav(`/export?ids=${[...lib.selected].join(',')}`)}
          onTag={() => setSheet('add')} onStar={() => void lib.star(true)} onDelete={() => void lib.remove()} />
      )}
      {lib.undo && (
        <div role="status" className="elev-4 fixed inset-x-5 bottom-[calc(var(--tabbar-h)+var(--sab)+1rem)] z-50 mx-auto flex max-w-md items-center justify-between rounded-lg bg-ink px-5 py-1 text-surface lg:left-[264px]">
          <span>{lib.undo.questions.length} deleted</span>
          <button type="button" className="min-h-[44px] px-3 font-semibold underline" onClick={() => void lib.doUndo()}>Undo</button>
        </div>
      )}
      <FilterSheet open={sheet === 'filters'} onClose={() => setSheet(null)} filters={lib.filters} tags={lib.tags}
        onChange={lib.setFilters} onManageTags={() => setSheet('manage')} />
      <AddTagSheet open={sheet === 'add'} existing={lib.tags.map(t => t.tag)} onAdd={t => void lib.addTag(t)} onClose={() => setSheet(null)} />
      <ManageTagsSheet open={sheet === 'manage'} tags={lib.tags} onChanged={() => void lib.reload()} onClose={() => setSheet(null)} />
    </div>
  );
}
