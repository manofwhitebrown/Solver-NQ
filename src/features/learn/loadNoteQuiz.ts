import { getNote } from '@/lib/db';
import { buildNoteQuiz } from '@/lib/notes';
import type { QuizSession } from './quizTypes';

/** Quiz from one note's key terms. Works fully offline. */
export async function loadNoteQuiz(noteId: string, count = 8): Promise<QuizSession | { error: string }> {
  const n = await getNote(noteId);
  if (!n) return { error: 'That note was not found.' };
  const { items, questions } = buildNoteQuiz(n, count);
  if (!items.length) return { error: 'This note has no clear definitions to quiz on yet. Try “Improve with AI” on the note first, or make flashcards from it.' };
  return { items, questions, timedSeconds: null };
}
