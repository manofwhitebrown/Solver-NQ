import { Link, useNavigate } from 'react-router-dom';
import { Button, toast } from '@/components/ui';
import { deleteNote } from '@/lib/db';
import { exportNote } from '@/lib/notes';
import type { Note } from '@/types';

export function NoteActions({ note }: { note: Note }) {
  const nav = useNavigate();
  const save = (k: 'md' | 'txt') => exportNote(note, k).catch(() => toast('Could not save the file.', 'error'));
  async function remove() {
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    await deleteNote(note.id); toast('Note deleted', 'success'); nav('/notes', { replace: true });
  }
  return (
    <div data-no-print className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Link to={`/learn/cards/new?note=${note.id}`}><Button block>Make flashcards</Button></Link>
        <Link to={`/learn/quiz?note=${note.id}`}><Button block variant="secondary" className="min-h-[48px]">Quiz me</Button></Link>
      </div>
      <p className="mt-2 text-caption font-bold uppercase tracking-wide text-muted">Save or share</p>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" className="min-h-[44px] px-2" onClick={() => save('md')}>Markdown</Button>
        <Button variant="secondary" size="sm" className="min-h-[44px] px-2" onClick={() => save('txt')}>Text</Button>
        <Button variant="secondary" size="sm" className="min-h-[44px] px-2" onClick={() => window.print()}>Print / PDF</Button>
      </div>
      <button type="button" onClick={remove} className="mt-2 min-h-[44px] self-start rounded-md px-3 text-base font-semibold text-bad transition hover:bg-bad-soft">Delete note</button>
    </div>
  );
}
