import type { Answer, Flashcard, Question } from '../../types';
import { newCardFields } from './scheduler';

export type CardDraft = Pick<Flashcard, 'front' | 'back'>;

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const key = (s: string) => clean(s).toLowerCase().replace(/[^\p{L}\p{N}$]+/gu, ' ').trim();

/** Definition-style lines: "Term: explanation", "Term is/are ...", "**Term** - ...". */
function definitionsFrom(text: string): CardDraft[] {
  const out: CardDraft[] = [];
  for (const raw of text.split(/\n+/)) {
    const line = raw.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, '').trim();
    let m = line.match(/^\*\*(.{2,50}?)\*\*\s*[:\-–—]\s*(.{12,})$/) ?? line.match(/^([A-Z][^:.$]{1,50}?):\s+(.{12,})$/);
    if (m) { out.push({ front: `What is ${clean(m[1])}?`, back: clean(m[2]) }); continue; }
    m = line.match(/^(?:A|An|The)?\s*([A-Za-z][\w\s-]{1,40}?)\s+(?:is|are|means|refers to)\s+(.{15,})$/);
    if (m && !/^(this|it|that|there|which)\b/i.test(m[1])) out.push({ front: `What is ${clean(m[1])}?`, back: clean(m[2]) });
  }
  return out;
}

/** Fully offline card generation from a saved answer. */
export function buildLocalCards(q: Question | undefined, a: Answer, maxStepCards = 6): CardDraft[] {
  const drafts: CardDraft[] = [];
  const qText = q?.text ? clean(q.text) : 'Question';
  if (a.finalAnswer.trim()) drafts.push({ front: qText, back: a.finalAnswer.trim() });
  a.steps.slice(0, maxStepCards).forEach((s, i) => {
    if (!s.body.trim()) return;
    drafts.push({ front: `${qText}\nStep ${i + 1}: ${s.title || 'what is the next step?'}`, back: s.body.trim() });
  });
  const text = [a.summary ?? '', ...a.steps.map((s) => s.body)].join('\n');
  drafts.push(...definitionsFrom(text).slice(0, 4));
  return dedupe(drafts);
}

export function dedupe(drafts: CardDraft[], existing: Array<Pick<Flashcard, 'front'>> = []): CardDraft[] {
  const seen = new Set(existing.map((c) => key(c.front)));
  return drafts.filter((d) => {
    const k = key(d.front);
    if (!k || !d.back.trim() || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function toFlashcards(drafts: CardDraft[], a: Answer, subject: Flashcard['subject'], now = Date.now()): Flashcard[] {
  return drafts.map((d, i) => ({
    id: `c_${now.toString(36)}_${i}_${Math.random().toString(36).slice(2, 7)}`,
    front: d.front, back: d.back, subject, sourceAnswerId: a.id, ...newCardFields(now),
  }));
}
