import type { Subject } from '@/types';
import { listLibrary } from '@/lib/db';
import { generateQuiz } from '@/lib/ai';
import { buildLocalQuiz } from '@/lib/srs';
import type { QuizConfig, QuizSession } from './quizTypes';

/** Build a quiz from saved questions. Uses the AI when online; any failure falls back to the local builder. */
export async function loadQuiz(cfg: QuizConfig): Promise<QuizSession | { error: string }> {
  const entries = await listLibrary({
    subject: (cfg.subject || undefined) as Subject | undefined,
    tag: cfg.tag.trim() || undefined,
  });
  const withAnswers = entries.filter((e) => e.a?.finalAnswer.trim());
  if (!withAnswers.length) return { error: 'No saved questions with answers match. Save a few answers first, or widen the filter.' };

  const count = Math.min(cfg.count, withAnswers.length);
  let items = buildLocalQuiz(withAnswers, count);
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const ai = await generateQuiz(withAnswers.slice(0, count).map((e) => e.q.id), count);
      if (ai.length) items = ai;
    } catch { /* offline, no key, or not implemented: keep local quiz */ }
  }
  const questions = Object.fromEntries(entries.map((e) => [e.q.id, e.q]));
  return { items, questions, timedSeconds: cfg.timed ? items.length * 60 : null };
}
