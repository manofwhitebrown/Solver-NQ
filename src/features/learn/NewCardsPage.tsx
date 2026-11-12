import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, EmptyState, Skeleton, Textarea, toast } from '@/components/ui';
import { putCard } from '@/lib/db';
import { makeCardsFromAnswer } from '@/lib/srs';
import type { Flashcard } from '@/types';

/** Preview cards made from a saved answer. Nothing is saved until the user confirms. */
export function NewCardsPage() {
  const answerId = useSearchParams()[0].get('answer');
  const navigate = useNavigate();
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!answerId) { setFailed(true); return; }
    let live = true;
    makeCardsFromAnswer(answerId)
      .then((c) => { if (live) { setCards(c); setPicked(new Set(c.map((x) => x.id))); } })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [answerId]);

  if (failed) {
    return <EmptyState title="Could not make cards" text="That answer was not found. Open a saved answer and try again."
      action={<Link to="/library"><Button variant="secondary">Go to library</Button></Link>} />;
  }
  if (!cards) return <div className="p-5"><Skeleton className="h-48 w-full" /></div>;
  if (cards.length === 0) {
    return <EmptyState title="No new cards" text="Every card for this answer already exists in your decks."
      action={<Link to="/learn/cards"><Button variant="secondary">Manage cards</Button></Link>} />;
  }

  const edit = (id: string, patch: Partial<Flashcard>) => setCards(cards.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (!n.delete(id)) n.add(id); return n; });
  const chosen = cards.filter((c) => picked.has(c.id) && c.front.trim() && c.back.trim());

  const save = async () => {
    setSaving(true);
    try {
      for (const c of chosen) await putCard({ ...c, front: c.front.trim(), back: c.back.trim() });
      toast(`Saved ${chosen.length} card${chosen.length === 1 ? '' : 's'}`, 'success');
      navigate('/learn');
    } catch { toast('Could not save the cards. Please try again.', 'error'); setSaving(false); }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5 pb-28">
      <h1 className="text-2xl font-semibold">Preview cards</h1>
      <p className="text-[15px] text-muted">Untick any you do not want, and edit the wording if you like.</p>
      <ul className="flex flex-col gap-3">
        {cards.map((c) => (
          <li key={c.id}>
            <Card className={`flex flex-col gap-2 ${picked.has(c.id) ? '' : 'opacity-50'}`}>
              <label className="flex min-h-[44px] items-center gap-3 text-sm font-medium">
                <input type="checkbox" className="h-5 w-5" checked={picked.has(c.id)} onChange={() => toggle(c.id)} />
                Keep this card
              </label>
              <Textarea aria-label="Front" value={c.front} onChange={(e) => edit(c.id, { front: e.target.value })} className="min-h-[72px]" />
              <Textarea aria-label="Back" value={c.back} onChange={(e) => edit(c.id, { back: e.target.value })} className="min-h-[72px]" />
            </Card>
          </li>
        ))}
      </ul>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface/95 p-4 backdrop-blur"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto max-w-2xl">
          <Button block loading={saving} disabled={!chosen.length} onClick={save}>Save {chosen.length} card{chosen.length === 1 ? '' : 's'}</Button>
        </div>
      </div>
    </div>
  );
}
