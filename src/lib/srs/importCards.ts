import type { Flashcard, Subject } from '@/types';
import { dedupe, type CardDraft } from './cardMaker';
import { newCardFields } from './scheduler';

export const SUBJECTS: Subject[] = ['math', 'physics', 'chemistry', 'biology', 'coding', 'languages', 'history', 'commerce', 'other'];
export const asSubject = (s: string | undefined, fallback: Subject = 'other'): Subject =>
  SUBJECTS.includes(s?.toLowerCase() as Subject) ? (s!.toLowerCase() as Subject) : fallback;

/** Turn parsed import rows into fresh cards, skipping duplicates of existing cards and of each other. */
export function cardsFromImport(
  rows: Array<CardDraft & { subject?: string }>,
  existing: Array<Pick<Flashcard, 'front'>>,
  defaultSubject: Subject = 'other',
  now = Date.now(),
): Flashcard[] {
  const fresh = dedupe(rows, existing);
  const subjectOf = new Map(rows.map((r) => [r.front, r.subject]));
  return fresh.map((d, i) => ({
    id: `c_${now.toString(36)}_i${i}_${Math.random().toString(36).slice(2, 7)}`,
    front: d.front, back: d.back, subject: asSubject(subjectOf.get(d.front), defaultSubject), ...newCardFields(now),
  }));
}
