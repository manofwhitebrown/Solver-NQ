import type { Flashcard, Note } from '@/types';
import { dedupe, newCardFields, type CardDraft } from '../srs';
import { extractGlossary } from './glossary';
import { splitSentences } from './sentences';

/** Parse stored "**Term**: definition" lines back into glossary items. */
export function parseTermLines(lines: string[] = []) {
  return lines.map((l) => l.match(/^\*\*(.+?)\*\*\s*[:\-–—]\s*(.+)$/)).filter((m): m is RegExpMatchArray => !!m)
    .map((m) => ({ term: m[1].trim(), definition: m[2].trim() }));
}

/** Offline card drafts: glossary first, then a few "complete the idea" cards from the strongest sentences. */
export function noteCardDrafts(n: Note, max = 15): CardDraft[] {
  const g = parseTermLines(n.keyTerms);
  const terms = g.length ? g : extractGlossary(n.text, max);
  const drafts: CardDraft[] = terms.map((t) => ({ front: `What is ${t.term}?`, back: t.definition }));
  if (drafts.length < 5) {
    for (const s of splitSentences(n.summary ?? n.text).slice(0, 6)) {
      const m = s.match(/^(.{12,60}?)\s+(?:because|so that|which|means|allows|causes)\s+(.{10,})$/i);
      if (m) drafts.push({ front: `${m[1]} ... (finish the idea)`, back: s });
    }
  }
  return drafts.slice(0, max);
}

/** Cards the user has not got yet (deduped against existing fronts), ready for the preview screen. */
export function noteFlashcards(n: Note, existing: Array<Pick<Flashcard, 'front'>>, now = Date.now()): Flashcard[] {
  return dedupe(noteCardDrafts(n), existing).map((d, i) => ({
    id: `c_${now.toString(36)}_${i}_${Math.random().toString(36).slice(2, 7)}`,
    front: d.front, back: d.back, subject: n.subject, ...newCardFields(now),
  }));
}
