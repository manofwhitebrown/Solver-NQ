import type { Answer } from '@/types';
import type { ExportItem } from './markdown';

export type AnswerHealth = 'ok' | 'blank' | 'cut';

/**
 * Is a saved answer worth exporting? Answers saved before the cut-off-reply fix can be empty, or hold one raw
 * step that starts with unparsed JSON (`{"finalAnswer":...`). Those are skipped instead of printed as junk.
 */
export function answerHealth(a?: Answer): AnswerHealth {
  if (!a) return 'ok'; // a question without an answer is exported as just the question
  const steps = a.steps.filter((s) => s.title.trim() || s.body.trim());
  if (!a.finalAnswer.trim() && !steps.length) return 'blank';
  if (!a.finalAnswer.trim() && steps.length === 1 && /^\s*(```(json)?\s*)?[{[]/.test(steps[0].body)) return 'cut';
  return 'ok';
}

export function dropIncomplete(items: ExportItem[]): { items: ExportItem[]; skipped: number } {
  const kept = items.filter((it) => answerHealth(it.a) === 'ok');
  return { items: kept, skipped: items.length - kept.length };
}

/** Largest pack we still draw as "pretty" images (about 1.2 s per answer measured); bigger packs use fast text pages. */
export const PRETTY_PACK_LIMIT = 120;
