import type { Answer, Question, QuizItem } from '@/types';

export interface LibraryEntry { q: Question; a?: Answer }

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Offline quiz from saved questions. Multiple choice when at least 3 other distinct
 * answers exist to use as distractors, otherwise a self-graded short-answer item.
 */
export function buildLocalQuiz(entries: LibraryEntry[], count: number, rng: () => number = Math.random): QuizItem[] {
  const usable = entries.filter((e) => e.a?.finalAnswer.trim());
  const pool = [...new Set(usable.map((e) => e.a!.finalAnswer.trim()))];
  return shuffle(usable, rng).slice(0, Math.max(0, count)).map((e) => {
    const answer = e.a!.finalAnswer.trim();
    const others = pool.filter((p) => norm(p) !== norm(answer));
    const item: QuizItem = {
      id: `qi_${e.q.id}`, questionId: e.q.id, prompt: e.q.text, answer,
      explanation: e.a!.summary || undefined,
    };
    if (others.length >= 3) item.options = shuffle([answer, ...shuffle(others, rng).slice(0, 3)], rng);
    return item;
  });
}

export const isCorrectChoice = (chosen: string, answer: string) => norm(chosen) === norm(answer);
