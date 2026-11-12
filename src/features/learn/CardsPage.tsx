import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, Input, Select, Skeleton, toast } from '@/components/ui';
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

  if (loading) return <div className="p-5"><Skeleton className="h-48 w-full" /></div>;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5 pb-8">
      <h1 className="text-2xl font-semibold">Cards</h1>
      <div className="grid grid-cols-2 gap-2">
        <Input aria-label="Search cards" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select aria-label="Filter by deck" value={subject} onChange={(e) => setSubject(e.target.value)}
          options={[{ value: '', label: 'All decks' }, ...SUBJECTS.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>Import</Button>
        <Button variant="secondary" disabled={!shown.length} onClick={() => act(() => exportDeck(shown, '\t'), 'Exported TSV')}>TSV</Button>
        <Button variant="secondary" disabled={!shown.length} onClick={() => act(() => exportDeck(shown, ','), 'Exported CSV')}>CSV</Button>
      </div>
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
      ) : shown.length === 0 ? <p className="py-6 text-center text-muted">No cards match.</p> : (
        <ul className="flex flex-col gap-2">
          {shown.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setEditing(c)} className="w-full text-left">
                <Card className="min-h-[44px] py-3 transition active:scale-[.99]">
                  <p className="line-clamp-2 text-[15px] font-medium">{c.front}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted">{c.back}</p>
                  <p className="mt-1 text-xs capitalize text-muted">{c.subject}</p>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CardEditor card={editing} onClose={() => setEditing(null)}
        onSave={(c) => { setEditing(null); void act(() => putCard(c), 'Card saved'); }}
        onDelete={(c) => { setEditing(null); void act(() => deleteCard(c.id), 'Card deleted'); }} />
    </div>
  );
}
