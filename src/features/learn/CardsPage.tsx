import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, Input, PageHeader, Select, Skeleton, Stack, Toolbar, toast } from '@/components/ui';
import { mathToPlain } from '@/features/answer/plainText';
import { deleteCard, putCard } from '@/lib/db';
import { SUBJECTS } from '@/lib/srs';
import type { Flashcard } from '@/types';
import { CardEditor } from './CardEditor';
import { exportDeck, importDeck } from './cardsIO';
import { useLearnData } from './useLearnData';

export function CardsPage() {
  const { cards, loading, reload } = useLearnData();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => (!subject || c.subject === subject) && (!q || (c.front + ' ' + c.back).toLowerCase().includes(q)));
  }, [cards, query, subject]);

  const act = async (fn: () => Promise<void>, ok: string) => {
    try { await fn(); toast(ok, 'success'); } catch { toast('Something went wrong. Please try again.', 'error'); }
    await reload();
  };

  if (loading) return <Skeleton className="h-48 w-full" />;

  return (
    <>
      <PageHeader title="Cards" subtitle={`${cards.length} card${cards.length === 1 ? '' : 's'}`} back="/learn" />
      <Stack gap={5}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input aria-label="Search cards" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select aria-label="Filter by deck" value={subject} onChange={(e) => setSubject(e.target.value)}
          options={[{ value: '', label: 'All decks' }, ...SUBJECTS.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]} />
      </div>
      <Toolbar>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>Import</Button>
        <Button variant="secondary" disabled={!shown.length} onClick={() => act(() => exportDeck(shown, '\t'), 'Exported TSV')}>TSV</Button>
        <Button variant="secondary" disabled={!shown.length} onClick={() => act(() => exportDeck(shown, ','), 'Exported CSV')}>CSV</Button>
      </Toolbar>
      <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/plain,text/csv" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]; e.target.value = '';
          if (f) void act(async () => {
            const r = await importDeck(f, (subject || 'other') as Flashcard['subject']);
            toast(`Added ${r.added}, skipped ${r.skipped} duplicates`, r.added ? 'success' : 'info');
          }, 'Import finished');
        }} />

      {cards.length === 0 ? (
        <EmptyState title="No cards yet" text="Import a deck, or make cards from a saved answer." action={<Link to="/learn"><Button variant="secondary">Back to Learn</Button></Link>} />
      ) : shown.length === 0 ? <p className="py-6 text-center text-base text-ink-2">No cards match.</p> : (
        <ul className="flex flex-col gap-4">
          {shown.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setEditing(c)} className="w-full text-left">
                <Card interactive className="min-h-[64px] py-4 lg:py-4">
                  <p className="line-clamp-2 text-base font-semibold text-ink">{mathToPlain(c.front)}</p>
                  <p className="mt-1 line-clamp-2 text-[15px] text-ink-2">{mathToPlain(c.back)}</p>
                  <p className="mt-2 text-[13px] capitalize text-muted">{c.subject}</p>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CardEditor card={editing} onClose={() => setEditing(null)}
        onSave={(c) => { setEditing(null); void act(() => putCard(c), 'Card saved'); }}
        onDelete={(c) => { setEditing(null); void act(() => deleteCard(c.id), 'Card deleted'); }} />
      </Stack>
    </>
  );
}
