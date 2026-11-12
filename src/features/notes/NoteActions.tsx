import { Link, useNavigate } from 'react-router-dom';
import { Button, Cluster, toast } from '@/components/ui';
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
      <Cluster gap={3}>
        <Link to={`/learn/cards/new?note=${note.id}`}><Button>Make flashcards</Button></Link>
        <Link to={`/learn/quiz?note=${note.id}`}><Button variant="secondary">Quiz me</Button></Link>
      </Cluster>
      <Cluster gap={3}>
        <Button variant="secondary" onClick={() => save('md')}>Save Markdown</Button>
        <Button variant="secondary" onClick={() => save('txt')}>Save text</Button>
        <Button variant="secondary" onClick={() => window.print()}>Print or PDF</Button>
        <Button variant="ghost" onClick={remove}>Delete</Button>
      </Cluster>
    </div>
  );
}
