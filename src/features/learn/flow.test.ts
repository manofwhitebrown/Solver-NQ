import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Answer, Question } from '@/types';
import { db, listCards, listDueCards, putCard, saveAnswer, saveQuestion } from '@/lib/db';
import { answerCurrent, makeCardsFromAnswer, score, startSession, summary, weakTopics, wrongIds, type QuizResult } from '@/lib/srs';
import { DAY_MS } from '@/lib/srs';
import { loadQuiz } from './loadQuiz';

// Offline: the AI layer fails, so the local fallbacks must carry the whole flow.
vi.mock('@/lib/ai', () => ({
  generateCards: async () => { throw new Error('offline'); },
  generateQuiz: async () => { throw new Error('offline'); },
}));

const q = (i: number, subject: Question['subject'], tags: string[] = []): Question =>
  ({ id: `q${i}`, text: `Question ${i}`, subject, tags, starred: false, createdAt: 1000 + i });
const a = (i: number): Answer => ({
  id: `a${i}`, questionId: `q${i}`, mode: 'learn', finalAnswer: `Answer ${i}`, verified: 'unchecked', model: 'm', createdAt: 2000,
  steps: [{ id: 's1', title: 'First step', body: `Do thing ${i}` }],
});

beforeEach(async () => { await Promise.all(db.tables.map((t) => t.clear())); });

describe('learning flow (offline, real db)', () => {
  it('make cards -> review -> intervals grow -> quiz -> weak topics', async () => {
    for (let i = 1; i <= 5; i++) {
      await saveQuestion(q(i, i <= 3 ? 'math' : 'physics', i === 1 ? ['algebra'] : []));
      await saveAnswer(a(i));
    }

    // 1. make cards from a saved answer (offline fallback), then save them
    const made = await makeCardsFromAnswer('a1');
    expect(made.length).toBeGreaterThanOrEqual(2);
    expect(made[0].back).toBe('Answer 1');
    for (const c of made) await putCard(c);
    expect(await listCards({})).toHaveLength(made.length);
    // making them again finds nothing new: no duplicates
    expect(await makeCardsFromAnswer('a1')).toHaveLength(0);

    // 2. review: all are due now; Good grows the interval 1 -> 3 -> 8 days
    let now = Date.now();
    const target = made[0].id;
    const intervals: number[] = [];
    for (let round = 0; round < 3; round++) {
      const due = await listDueCards(now);
      expect(due.map((c) => c.id)).toContain(target);
      let s = startSession(due, now);
      while (s.queue.length) {
        const cur = s.queue[0];
        const r = answerCurrent(s, 2, now);
        await putCard(r.updated);
        if (cur.id === target) intervals.push(r.updated.interval);
        s = r.session;
      }
      expect(summary(s).again).toBe(0);
      now += intervals[intervals.length - 1] * DAY_MS + 1; // jump to when it is due again
    }
    expect(intervals).toEqual([1, 3, 8]);
    expect((await listDueCards(Date.now())).length).toBe(0); // nothing due right now after reviewing

    // 3. quiz built from saved questions, multiple choice (5 distinct answers)
    const session = await loadQuiz({ subject: '', tag: '', count: 5, timed: false });
    if ('error' in session) throw new Error(session.error);
    expect(session.items).toHaveLength(5);
    expect(session.items.every((it) => it.options?.includes(it.answer))).toBe(true);

    // 4. answer physics questions wrong, math right -> weak topics point at physics, retry list is right
    const results: QuizResult[] = session.items.map((it) => {
      const qq = session.questions[it.questionId];
      return { questionId: qq.id, subject: qq.subject, tags: qq.tags, correct: qq.subject === 'math' };
    });
    expect(score(results)).toEqual({ total: 5, correct: 3, percent: 60 });
    expect(weakTopics(results)[0]).toMatchObject({ topic: 'physics', accuracy: 0 });
    expect(wrongIds(results).sort()).toEqual(['q4', 'q5']);
  });

  it('quiz setup reports a friendly error when nothing matches', async () => {
    await saveQuestion(q(1, 'math')); // no answer saved
    expect(await loadQuiz({ subject: '', tag: '', count: 5, timed: false })).toHaveProperty('error');
  });
});
