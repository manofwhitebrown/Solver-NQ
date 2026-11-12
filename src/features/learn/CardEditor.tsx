import { useEffect, useState } from 'react';
import { Button, Dialog, Field, Select, Textarea } from '@/components/ui';
import { SUBJECTS, asSubject } from '@/lib/srs';
import type { Flashcard } from '@/types';

export function CardEditor({ card, onSave, onDelete, onClose }: {
  card: Flashcard | null; onSave: (c: Flashcard) => void; onDelete: (c: Flashcard) => void; onClose: () => void;
}) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subject, setSubject] = useState('other');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (card) { setFront(card.front); setBack(card.back); setSubject(card.subject); setConfirm(false); } }, [card]);

  const valid = front.trim() && back.trim();
  return (
    <Dialog open={!!card} onClose={onClose} title="Edit card"
      actions={card && (
        <>
          <Button variant={confirm ? 'danger' : 'ghost'} onClick={() => (confirm ? onDelete(card) : setConfirm(true))}>
            {confirm ? 'Really delete?' : 'Delete'}
          </Button>
          <Button disabled={!valid} onClick={() => onSave({ ...card, front: front.trim(), back: back.trim(), subject: asSubject(subject) })}>Save</Button>
        </>
      )}>
      <div className="flex flex-col gap-3 text-ink">
        <Field label="Front" htmlFor="ce-front"><Textarea id="ce-front" value={front} onChange={(e) => setFront(e.target.value)} className="min-h-[80px]" /></Field>
        <Field label="Back" htmlFor="ce-back"><Textarea id="ce-back" value={back} onChange={(e) => setBack(e.target.value)} className="min-h-[80px]" /></Field>
        <Field label="Deck (subject)" htmlFor="ce-subject">
          <Select id="ce-subject" value={subject} onChange={(e) => setSubject(e.target.value)}
            options={SUBJECTS.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))} />
        </Field>
      </div>
    </Dialog>
  );
}
