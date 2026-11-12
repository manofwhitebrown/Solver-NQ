import type { Answer, Flashcard, Note, Question } from '@/types';
import { db } from './db';
import { resetIndex } from './search';
import { DEMO_NOTES, DEMO_QUESTIONS } from './demoData';

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
export const demoQuestionId = (n: number) => `demo-q${pad(n)}`;
export const demoAnswerId = (n: number, other = false) => `demo-a${pad(n)}${other ? 'b' : ''}`;

/** Ids the screenshot tool uses to open screens. */
export const DEMO_IDS = {
  learn: demoAnswerId(1), answer: demoAnswerId(4), wideMath: demoAnswerId(2), code: demoAnswerId(10),
  longWord: demoAnswerId(9), longQuestion: demoAnswerId(13), mismatch: demoAnswerId(7),
  all: DEMO_QUESTIONS.map(q => demoAnswerId(q.n)),
};
export const DEMO_STUDY_PLAN_KEY = 'study-plan';

export const demoEnabled = (): boolean => import.meta.env.VITE_DEMO === '1' || !!import.meta.env.DEV;

/** Fill the database with realistic sample content. Idempotent; refuses to run in a normal production build. */
export async function seedDemoData(): Promise<typeof DEMO_IDS | null> {
  if (!demoEnabled()) return null;
  if (await db.questions.get(demoQuestionId(1))) return DEMO_IDS;
  const now = Date.now();
  const questions: Question[] = [];
  const answers: Answer[] = [];
  for (const d of DEMO_QUESTIONS) {
    const t = now - (d.n - 1) * DAY - d.n * 3_600_000;
    questions.push({ id: demoQuestionId(d.n), text: d.text, subject: d.subject, tags: d.tags, starred: !!d.starred, createdAt: t });
    const mk = (id: string, mode: Answer['mode'], final: string, steps: Array<[string, string]>, createdAt: number, verified: Answer['verified']): Answer => ({
      id, questionId: demoQuestionId(d.n), mode, finalAnswer: final, verified, model: 'gemini-2.5-flash', createdAt,
      steps: steps.map(([title, body], i) => ({ id: `${id}-s${i + 1}`, title, body })),
    });
    answers.push(mk(demoAnswerId(d.n), d.mode, d.final, d.steps, t, d.verified));
    if (d.other) answers.push(mk(demoAnswerId(d.n, true), d.other.mode, d.other.final, d.other.steps, t - 60_000, 'unchecked'));
  }
  const cards: Flashcard[] = Array.from({ length: 12 }, (_, i) => {
    const d = DEMO_QUESTIONS[i];
    return { id: `demo-c${pad(i + 1)}`, front: `Key idea: ${d.text.replace(/\n.*/s, '').slice(0, 70)}`, back: d.final, subject: d.subject,
      sourceAnswerId: demoAnswerId(d.n), due: i < 7 ? now - DAY : now + (i - 6) * DAY, interval: i % 5, ease: 2.5, reps: i % 4, lapses: i % 3 };
  });
  const notes: Note[] = DEMO_NOTES.map(n => ({ id: `demo-n${pad(n.n)}`, title: n.title, source: n.source, text: n.text, summary: n.summary,
    cheatsheet: n.cheatsheet, keyTerms: n.keyTerms, subject: n.subject, tags: n.tags, createdAt: now - n.n * DAY, updatedAt: now - n.n * DAY }));
  await db.transaction('rw', [db.questions, db.answers, db.flashcards, db.notes, db.kv], async () => {
    await db.questions.bulkPut(questions);
    await db.answers.bulkPut(answers);
    await db.flashcards.bulkPut(cards);
    await db.notes.bulkPut(notes);
    await db.kv.put({ key: DEMO_STUDY_PLAN_KEY, value: { exam: 'Physics mock exam', date: now + 14 * DAY, subjects: ['physics', 'math'], minutesPerDay: 45 } });
  });
  seedProgress(now);
  resetIndex();
  return DEMO_IDS;
}

/** A week of review history so Stats and the streak look alive (stored where the Learn feature keeps it). */
function seedProgress(now: number): void {
  try {
    const days: Record<string, { reviews: number; correct: number }> = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(now - i * DAY);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      days[key] = { reviews: 8 + ((i * 5) % 14), correct: 6 + ((i * 3) % 9) };
    }
    localStorage.setItem('solvernq.srs.progress', JSON.stringify({ goal: 20, days }));
  } catch { /* storage blocked: stats just stay empty */ }
}
