import type { Answer, Note, Question, QuizItem } from '@/types';
import { buildLocalQuiz, type LibraryEntry } from '../srs';
import { extractGlossary } from './glossary';
import { parseTermLines } from './noteCards';

/** Offline quiz from the note's key terms: "What is X?" with other definitions as wrong options. */
export function buildNoteQuiz(n: Note, count = 8, rng: () => number = Math.random): { items: QuizItem[]; questions: Record<string, Question> } {
  const g = parseTermLines(n.keyTerms);
  const terms = g.length ? g : extractGlossary(n.text, 30);
  const entries: LibraryEntry[] = terms.map((t, i) => {
    const q: Question = { id: `${n.id}#${i}`, text: `What is ${t.term}?`, subject: n.subject, tags: n.tags, starred: false, createdAt: n.createdAt };
    const a: Answer = { id: `a_${q.id}`, questionId: q.id, mode: 'answer', finalAnswer: t.definition, steps: [], verified: 'unchecked', model: 'notes', createdAt: n.createdAt };
    return { q, a };
  });
  const items = buildLocalQuiz(entries, count, rng);
  return { items, questions: Object.fromEntries(entries.map((e) => [e.q.id, e.q])) };
}
