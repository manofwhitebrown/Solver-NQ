import { getNote, listCards } from '@/lib/db';
import { noteFlashcards } from '@/lib/notes';
import type { Flashcard } from '@/types';

/** Preview cards for a note, skipping any that already exist. Throws when the note is gone. */
export async function cardsFromNote(noteId: string): Promise<Flashcard[]> {
  const n = await getNote(noteId);
  if (!n) throw new Error('note-missing');
  return noteFlashcards(n, await listCards({}));
}
