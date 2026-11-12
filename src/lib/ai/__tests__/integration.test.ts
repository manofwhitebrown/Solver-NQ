import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/settings', () => ({
  getSettings: () => ({ provider: 'anthropic', model: 'test-model', apiKey: 'k', baseUrl: '', proxyUrl: '' }),
}));
vi.mock('@/components/ui', () => ({ toast: vi.fn() }));

import { generateCards, generateQuiz, askQuestion, flushPending, followUp, similarProblem } from '..';
import { getAnswer, getQuestion, listPending, listLibrary } from '@/lib/db';

const answerJson = JSON.stringify({
  finalAnswer: 'x=6', summary: 'Subtract then divide.',
  steps: [{ title: 'Subtract 5', body: '$2x=12$' }, { title: 'Divide', body: '$x=6$' }],
});

/** Fake Anthropic: picks a reply from the system prompt. */
function fakeNetwork() {
  return vi.fn(async (_url: string, init: { body: string }) => {
    const { system } = JSON.parse(init.body) as { system: string };
    let text = answerJson;
    if (system.includes('flashcards')) text = '[{"front":"Inverse of +5?","back":"Subtract 5"},{"front":"","back":"skip me"}]';
    else if (system.includes('Make quiz items')) text = '[{"source":0,"prompt":"Solve 2x+5=17","options":["5","6","7","8"],"answer":"6","explanation":"x=6"}]';
    else if (system.includes('practice problem')) text = '{"text":"Solve 3x+4=19"}';
    else if (system.includes('follow-up')) text = '{"title":"Why subtract?","body":"To isolate $2x$."}';
    return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), { status: 200 });
  });
}

beforeEach(() => { vi.stubGlobal('navigator', { onLine: true }); vi.stubGlobal('fetch', fakeNetwork()); });

describe('engine + real db', () => {
  it('asks, saves, and serves follow-up / cards / quiz / similar problem', async () => {
    const r = await askQuestion({ text: 'Solve 2x+5=17', subject: 'math', mode: 'learn' }) as { answerId: string };
    const a = await getAnswer(r.answerId);
    expect(a?.steps.map((s) => s.title)).toEqual(['Subtract 5', 'Divide']);
    const q = await getQuestion(a!.questionId);
    expect(q?.text).toBe('Solve 2x+5=17');
    expect((await listLibrary({})).some((e) => e.q.id === q!.id && e.a?.id === a!.id)).toBe(true);

    const step = await followUp(r.answerId, 'why subtract?');
    expect(step).toMatchObject({ title: 'Why subtract?', body: 'To isolate $2x$.' });
    expect(step.id).toBeTruthy();

    expect(await generateCards(r.answerId)).toEqual([{ front: 'Inverse of +5?', back: 'Subtract 5' }]);
    expect(await similarProblem(r.answerId)).toEqual({ text: 'Solve 3x+4=19' });

    const quiz = await generateQuiz([q!.id], 3);
    expect(quiz).toHaveLength(1);
    expect(quiz[0]).toMatchObject({ questionId: q!.id, answer: '6', options: ['5', '6', '7', '8'] });
  });

  it('repeat question is served from the real cache with no network', async () => {
    const first = await askQuestion({ text: 'Cache me please', subject: 'other', mode: 'answer' }) as { answerId: string };
    const f = vi.fn(); vi.stubGlobal('fetch', f); vi.stubGlobal('navigator', { onLine: false });
    const again = await askQuestion({ text: '  CACHE   me please ', subject: 'other', mode: 'answer' }) as { answerId: string };
    expect(again.answerId).toBe(first.answerId);
    expect(f).not.toHaveBeenCalled();
  });

  it('queues offline in the real db and flushes on reconnect', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect(await askQuestion({ text: 'Offline question one', subject: 'history', mode: 'answer' })).toEqual({ queued: true });
    expect(await listPending()).toHaveLength(1);

    vi.stubGlobal('navigator', { onLine: true });
    await flushPending();
    expect(await listPending()).toHaveLength(0);
    const hit = (await listLibrary({})).find((e) => e.q.text === 'Offline question one');
    expect(hit?.a?.finalAnswer).toBe('x=6');
  });
});
