import type { Subject } from '../../types';

// Local shape of a graded quiz answer; the UI maps QuizItem (from lib/ai) into this.
export interface QuizResult {
  questionId: string;
  subject: Subject;
  tags: string[];
  correct: boolean;
}

export interface TopicStat { topic: string; total: number; correct: number; accuracy: number }

export function score(results: QuizResult[]): { total: number; correct: number; percent: number } {
  const correct = results.filter((r) => r.correct).length;
  return { total: results.length, correct, percent: results.length ? Math.round((correct / results.length) * 100) : 0 };
}

/** Accuracy per subject and per tag, weakest first. Topics with < minSamples answers are skipped. */
export function weakTopics(results: QuizResult[], minSamples = 1): TopicStat[] {
  const map = new Map<string, { total: number; correct: number }>();
  const bump = (topic: string, ok: boolean) => {
    const s = map.get(topic) ?? { total: 0, correct: 0 };
    s.total++; if (ok) s.correct++;
    map.set(topic, s);
  };
  for (const r of results) {
    bump(r.subject, r.correct);
    for (const t of new Set(r.tags)) bump(`#${t}`, r.correct);
  }
  return [...map.entries()]
    .filter(([, s]) => s.total >= minSamples)
    .map(([topic, s]) => ({ topic, ...s, accuracy: s.correct / s.total }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
}

export const wrongIds = (results: QuizResult[]): string[] =>
  [...new Set(results.filter((r) => !r.correct).map((r) => r.questionId))];


/** Remaining seconds for timed exam mode; never negative. */
export function remainingSeconds(startedAt: number, limitSeconds: number, now = Date.now()): number {
  return Math.max(0, limitSeconds - Math.floor((now - startedAt) / 1000));
}
