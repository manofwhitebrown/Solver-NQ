import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, EmptyState, Input } from '@/components/ui';
import { FilterBar } from './FilterBar';
import { Row } from './Row';
import { SelectionBar } from './SelectionBar';
import { AddTagSheet, ManageTagsSheet } from './TagSheet';
import { useLibrary } from './useLibrary';

const PAGE = 40; // render in pages so 1000+ items stay fast

export default function LibraryPage() {
  const lib = useLibrary();
  const nav = useNavigate();
  const [sheet, setSheet] = useState<'add' | 'manage' | null>(null);
  const [shown, setShown] = useState(PAGE);
  const selecting = lib.selectMode;

  useEffect(() => setShown(PAGE), [lib.query, lib.filters]);
  useEffect(() => {
    if (!lib.undo) return;
    const id = setTimeout(lib.dismissUndo, 8000);
    return () => clearTimeout(id);
  }, [lib.undo, lib.dismissUndo]);

  const items = lib.items;
  const filtered = !!lib.query || !!lib.filters.subject || !!lib.filters.tag || !!lib.filters.starred;

  return (
    <div className="pb-24">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Library</h1>
        {!selecting && !!lib.items?.length && <Button variant="ghost" onClick={lib.startSelecting}>Select</Button>}
      </div>
      <Input type="search" value={lib.query} onChange={e => lib.setQuery(e.target.value)} placeholder="Search questions, answers, tags"
        aria-label="Search library" className="mb-3" />
      <FilterBar filters={lib.filters} tags={lib.tags} onChange={lib.setFilters} onManageTags={() => setSheet('manage')} />

      {items === null && <p className="py-16 text-center text-muted">Loading…</p>}
      {items?.length === 0 && (filtered
        ? <EmptyState title="Nothing matches" text="Try a different search or clear a filter." />
        : <EmptyState icon={<span className="text-4xl">📚</span>} title="Your library is empty"
            text="Ask a question or scan one from your notebook. Every answer is saved here automatically, so you can find it again, even offline."
            action={<div className="flex gap-3">
              <Link to="/"><Button>Ask a question</Button></Link>
              <Link to="/scan"><Button variant="secondary">Scan</Button></Link>
            </div>} />)}
      {!!items?.length && (
        <>
          <ul className="mt-4 space-y-2">
            {items.slice(0, shown).map(it => (
              <Row key={it.q.id} item={it} selecting={selecting} selected={lib.selected.has(it.q.id)}
                onToggle={() => lib.toggle(it.q.id)} onStar={() => void lib.toggleStar(it.q.id, !it.q.starred)} />
            ))}
          </ul>
          {shown < items.length && (
            <Button variant="secondary" className="mx-auto mt-4 flex" onClick={() => setShown(n => n + PAGE)}>
              Show more ({items.length - shown})
            </Button>
          )}
        </>
      )}

      {selecting && (
        <SelectionBar count={lib.selected.size} onCancel={lib.clearSelection}
          onExport={() => lib.selected.size && nav(`/export?ids=${[...lib.selected].join(',')}`)}
          onTag={() => setSheet('add')} onStar={() => void lib.star(true)} onDelete={() => void lib.remove()} />
      )}
      {lib.undo && (
        <div role="status" className="fixed inset-x-4 bottom-[calc(4.75rem+var(--sab))] z-50 mx-auto flex max-w-md items-center justify-between rounded-md bg-ink px-4 py-1 text-surface shadow-lift">
          <span>{lib.undo.questions.length} deleted</span>
          <button type="button" className="min-h-[44px] px-3 font-semibold underline" onClick={() => void lib.doUndo()}>Undo</button>
        </div>
      )}
      <AddTagSheet open={sheet === 'add'} existing={lib.tags.map(t => t.tag)} onAdd={t => void lib.addTag(t)} onClose={() => setSheet(null)} />
      <ManageTagsSheet open={sheet === 'manage'} tags={lib.tags} onChanged={() => void lib.reload()} onClose={() => setSheet(null)} />
    </div>
  );
}
