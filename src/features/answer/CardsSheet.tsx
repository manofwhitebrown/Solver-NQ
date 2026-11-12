import { useState } from 'react';
import type { Flashcard } from '@/types';
import { BottomSheet, Button, Card, toast } from '@/components/ui';
import { putCard } from '@/lib/db';
import { Markdown } from './Markdown';

/** Preview of generated flashcards: remove the ones you do not want, then add the rest. */
export function CardsSheet({ cards, onClose }: { cards: Flashcard[] | null; onClose: () => void }) {
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const keep = (cards ?? []).filter((c) => !removed.has(c.id));

  const save = async () => {
    try {
      await Promise.all(keep.map((c) => putCard(c)));
      toast(`${keep.length} flashcard${keep.length === 1 ? '' : 's'} added`, 'success');
      setRemoved(new Set());
      onClose();
    } catch { toast('Could not save the flashcards', 'error'); }
  };

  return (
    <BottomSheet open={cards !== null} onClose={onClose} title="New flashcards">
      <div className="space-y-3">
        {cards?.length === 0 && <p className="text-sm text-muted">No new cards to add - you already have these.</p>}
        {(cards ?? []).map((c) => (
          <Card key={c.id} className={removed.has(c.id) ? 'p-3 opacity-40' : 'p-3'}>
            <div className="text-sm font-medium"><Markdown>{c.front}</Markdown></div>
            <div className="mt-1 text-sm text-muted"><Markdown>{c.back}</Markdown></div>
            <button type="button" className="mt-1 min-h-[44px] text-sm font-medium text-accent"
              onClick={() => setRemoved((s) => { const n = new Set(s); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}>
              {removed.has(c.id) ? 'Keep' : 'Remove'}
            </button>
          </Card>
        ))}
        <Button block disabled={keep.length === 0} onClick={() => void save()}>Add {keep.length} card{keep.length === 1 ? '' : 's'}</Button>
      </div>
    </BottomSheet>
  );
}
