import type { Note, NoteFilter } from '@/types';
import { db } from './db';
import { reindexNote, searchNoteIds, unindexNote } from './search';

export async function saveNote(n: Note): Promise<void> {
  await db.notes.put(n);
  await reindexNote(n);
}

export const getNote = (id: string) => db.notes.get(id);

/** Newest-edited first. A non-empty `text` searches title, body, summary and key terms offline. */
export async function listNotes(filter: NoteFilter & { text?: string } = {}): Promise<Note[]> {
  let notes: Note[];
  if (filter.text?.trim()) {
    const ids = await searchNoteIds(filter.text);
    notes = (await db.notes.bulkGet(ids)).filter((n): n is Note => !!n);
  } else if (filter.tag) notes = await db.notes.where('tags').equals(filter.tag).toArray();
  else if (filter.subject) notes = await db.notes.where('subject').equals(filter.subject).toArray();
  else notes = await db.notes.toArray();
  if (filter.tag) notes = notes.filter(n => n.tags.includes(filter.tag!));
  if (filter.subject) notes = notes.filter(n => n.subject === filter.subject);
  return filter.text?.trim() ? notes : notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
  await unindexNote(id);
}
