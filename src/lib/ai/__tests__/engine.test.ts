import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetCache, update } from '../fallback/store';
import type { Answer } from '@/types';

type Row = { id: string; [k: string]: unknown };
const store = vi.hoisted(() => {
  type R = { id: string; [k: string]: unknown };
  return { q: new Map<string, R>(), a: new Map<string, R>(), cache: new Map<string, R>(), pending: new Map<string, R>() };
});

vi.mock('@/lib/db', () => ({
  saveQuestion: async (q: Row) => { store.q.set(q.id, q); },
  saveAnswer: async (a: Row) => { store.a.set(a.id, a); },
  getAnswer: async (id: string) => store.a.get(id),
  getQuestion: async (id: string) => store.q.get(id),
  getCachedAnswer: async (h: string) => store.cache.get(h),
  putCachedAnswer: async (h: string, a: Row) => { store.cache.set(h, a); },
  queuePending: async (i: Row) => { store.pending.set(i.id, i); },
  listPending: async () => [...store.pending.values()],
  removePending: async (id: string) => { store.pending.delete(id); },
  listLibrary: async () => [],
}));
vi.mock('@/lib/settings', () => ({
  getSettings: () => ({ provider: 'anthropic', model: 'test-model', apiKey: 'k', baseUrl: '', proxyUrl: '' }),
}));
vi.mock('@/components/ui', () => ({ toast: vi.fn() }));

import { askQuestion, flushPending } from '..';

const reply = JSON.stringify({ finalAnswer: 'x=2', steps: [{ title: 'Solve', body: '$x=2$' }], summary: 's' });
const okFetch = () => vi.fn(async () => new Response(JSON.stringify({ content: [{ type: 'text', text: reply }] }), { status: 200 }));
const input = { text: 'Solve x+1=3', subject: 'math', mode: 'learn' } as const;

beforeEach(() => {
  resetCache(); // each test starts with a fresh key pool built from the mocked settings
  Object.values(store).forEach((m) => m.clear());
  vi.stubGlobal('navigator', { onLine: true });
});

describe('askQuestion', () => {
  it('saves a parsed answer and returns its id', async () => {
    vi.stubGlobal('fetch', okFetch());
    const r = await askQuestion(input);
    expect('answerId' in r).toBe(true);
    const a = store.a.get((r as { answerId: string }).answerId) as unknown as Answer;
    expect(a.finalAnswer).toBe('x=2');
    expect(a.steps[0].id).toBeTruthy();
    expect(a.model).toBe('test-model');
    expect(store.cache.size).toBe(1);
  });

  it('answers the same question from cache without calling the network', async () => {
    const f = okFetch();
    vi.stubGlobal('fetch', f);
    const first = await askQuestion(input) as { answerId: string };
    const again = await askQuestion({ ...input, text: '  solve   X+1=3 ' }) as { answerId: string };
    expect(again.answerId).toBe(first.answerId);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('queues when offline, then flushes when back online', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    const offlineFetch = vi.fn();
    vi.stubGlobal('fetch', offlineFetch);
    expect(await askQuestion(input)).toEqual({ queued: true });
    expect(store.pending.size).toBe(1);
    expect(offlineFetch).not.toHaveBeenCalled(); // offline: never touches the network

    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', okFetch());
    await flushPending();
    expect(store.pending.size).toBe(0);
    expect(store.a.size).toBe(1);
  });

  it('when every slot is rate limited the question is queued, then answered after the quota resets', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 429 })));
    const r = await askQuestion(input) as { queued: true; retryAt?: number };
    expect(r.queued).toBe(true);
    expect(r.retryAt).toBeGreaterThan(Date.now());
    expect(store.pending.size).toBe(1);

    update(s => { s.cooldowns = {}; }); // quota reset
    vi.stubGlobal('fetch', okFetch());
    await flushPending();
    expect(store.pending.size).toBe(0);
    expect(store.a.size).toBe(1);
  });

  it('shows a friendly message for a rejected key', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })));
    await expect(askQuestion(input)).rejects.toThrow(/key was rejected/i);
  });

  it('accepts an image-only question, sends the image, and does not cache it', async () => {
    const f = okFetch();
    vi.stubGlobal('fetch', f);
    const r = await askQuestion({ text: '  ', subject: 'math', mode: 'answer', imageDataUrl: 'data:image/png;base64,AAAA' });
    expect('answerId' in r).toBe(true);
    const body = JSON.parse((f.mock.calls[0] as unknown as [string, { body: string }])[1].body);
    expect(JSON.stringify(body.messages)).toContain('"type":"image"');
    expect(JSON.stringify(body.messages)).toContain('shown in the image');
    expect(store.cache.size).toBe(0);
  });
});
