import type { Flashcard } from '../../types';
import { getAnswer, getQuestion, listCards } from '../db';
import { generateCards } from '../ai';
import { buildLocalCards, dedupe, toFlashcards, type CardDraft } from './cardMaker';

export * from './scheduler';
export * from './day';
export * from './progress';
export * from './cardMaker';
export * from './csv';
export * from './quizScore';
export * from './session';
export * from './quizBuild';

/**
 * Build (not save) cards for a saved answer. Local first; if online, try to
 * improve with the AI, falling back silently to the local set.
 * The UI previews the result and saves with putCard().
 */
export async function makeCardsFromAnswer(answerId: string): Promise<Flashcard[]> {
  const a = await getAnswer(answerId);
  if (!a) throw new Error('Answer not found');
  const q = await getQuestion(a.questionId);
  const subject = q?.subject ?? 'other';

  let drafts: CardDraft[] = buildLocalCards(q, a);
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const ai = await generateCards(answerId);
      if (ai.length) drafts = [...ai, ...drafts];
    } catch { /* offline or no key: keep local cards */ }
  }
  const existing = await listCards({});
  return toFlashcards(dedupe(drafts, existing), a, subject);
}
