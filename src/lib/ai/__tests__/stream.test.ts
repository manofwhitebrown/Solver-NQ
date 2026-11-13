import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/settings', () => ({ getSettings: () => ({ provider: 'gemini', model: '', apiKey: '', baseUrl: '', proxyUrl: '' }) }));

import { AiError } from '../errors';
import { previewAnswer, parseAnswer } from '../parse';
import { callWithFallback } from '../fallback/callWithFallback';
import { readGeminiStream } from '../fallback/slotCall';
import { resetCache } from '../fallback/store';
import { resetThrottle } from '../fallback/throttle';
import type { FallbackState } from '../fallback/types';

const enc = new TextEncoder();
const chunk = (text: string, finishReason?: string) =>
  `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, ...(finishReason ? { finishReason } : {}) }] })}\r\n\r\n`;
/** A Response whose body arrives in the given pieces (pieces may split a line in half, like a real network). */
const sse = (pieces: string[]) => new Response(new ReadableStream({
  start(c) { for (const p of pieces) c.enqueue(enc.encode(p)); c.close(); },
}));

describe('readGeminiStream', () => {
  it('reports the growing text and returns the final text', async () => {
    const seen: string[] = [];
    const text = await readGeminiStream(sse([chunk('Hel'), chunk('lo', 'STOP')]), t => seen.push(t));
    expect(text).toBe('Hello');
    expect(seen).toEqual(['', 'Hel', 'Hello']);
  });
  it('copes with a line split across two network pieces', async () => {
    const whole = chunk('abc') + chunk('def', 'STOP');
    const text = await readGeminiStream(sse([whole.slice(0, 20), whole.slice(20, 70), whole.slice(70)]), () => {});
    expect(text).toBe('abcdef');
  });
  it('a stream that stops early (MAX_TOKENS) is incomplete, not an answer', async () => {
    await expect(readGeminiStream(sse([chunk('part', 'MAX_TOKENS')]), () => {})).rejects.toMatchObject({ failure: { kind: 'incomplete', reason: 'cut_off' } });
  });
  it('an empty stream is incomplete (empty); a blocked one is a safety failure', async () => {
    await expect(readGeminiStream(sse([chunk('', 'STOP')]), () => {})).rejects.toMatchObject({ failure: { kind: 'incomplete', reason: 'empty' } });
    const blocked = `data: ${JSON.stringify({ promptFeedback: { blockReason: 'SAFETY' } })}\n\n`;
    await expect(readGeminiStream(sse([blocked]), () => {})).rejects.toMatchObject({ failure: { kind: 'safety' } });
  });
});

describe('streaming through the fallback chain', () => {
  const mem = new Map<string, string>();
  const fetchMock = vi.fn();
  const SECRET = 'AIzaSECRETKEY111111';
  beforeEach(() => {
    mem.clear(); fetchMock.mockReset(); resetThrottle();
    const s: FallbackState = {
      version: 1, saveQuota: false, perMinute: 100, cooldowns: {}, invalidKeys: [], fetchedFor: [], legacySeen: 'x',
      keys: [{ id: 'k1', provider: 'gemini', label: 'a', key: SECRET }],
      chain: ['m-a', 'm-b'].map((model, i) => ({ id: `s${i}`, provider: 'gemini' as const, model, keyId: '', enabled: true, verified: true })),
    };
    mem.set('solvernq.ai.v2', JSON.stringify(s));
    resetCache();
    vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); } });
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());
  const req = (onPartial?: (t: string) => void) => ({ system: 's', messages: [{ role: 'user' as const, content: 'q' }], onPartial });
  const opts = { now: () => Date.UTC(2026, 10, 12, 20), sleep: async () => {} };

  it('uses streamGenerateContent only when asked to stream, and delivers the text', async () => {
    fetchMock.mockResolvedValueOnce(sse([chunk('one '), chunk('two', 'STOP')]));
    const seen: string[] = [];
    const r = await callWithFallback(req(t => seen.push(t)), opts);
    expect(r.text).toBe('one two');
    expect(String(fetchMock.mock.calls[0][0])).toContain(':streamGenerateContent?alt=sse');
    expect(seen.at(-1)).toBe('one two');
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'x' }] }, finishReason: 'STOP' }] }), text: async () => '' });
    await callWithFallback(req(), opts);
    expect(String(fetchMock.mock.calls[1][0])).toContain(':generateContent');
    expect(String(fetchMock.mock.calls[1][0])).not.toContain('stream');
  });
  it('a stream cut off half way tries the next model, and the screen restarts from empty', async () => {
    fetchMock.mockResolvedValueOnce(sse([chunk('half an ans', 'MAX_TOKENS')]));
    fetchMock.mockResolvedValueOnce(sse([chunk('whole answer', 'STOP')]));
    const seen: string[] = [];
    const r = await callWithFallback(req(t => seen.push(t)), opts);
    expect(r.text).toBe('whole answer');
    expect(r.model).toBe('m-b');
    expect(seen).toEqual(['', 'half an ans', '', 'whole answer']);
  });
  it('an HTTP error before any text is classified as usual and never shows the key', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, text: async () => 'bad', json: async () => ({}) });
    const err = await callWithFallback(req(() => {}), opts).catch(e => e);
    expect(err).toBeInstanceOf(AiError);
    expect(err.code).toBe('bad_key');
    expect(JSON.stringify(err) + err.message).not.toContain(SECRET);
  });
});

describe('previewAnswer (cut-off JSON while streaming)', () => {
  const full = JSON.stringify({ finalAnswer: 'x = 6', steps: [{ title: 'Subtract 5', body: 'Get $2x = 12$.\nNext "line"' }, { title: 'Divide', body: 'So $x = 6$.' }], summary: 'Done.' });
  it('is null until it looks like an answer', () => {
    expect(previewAnswer('')).toBeNull();
    expect(previewAnswer('Sure! Here')).toBeNull();
    expect(previewAnswer('{"finalAn')).toBeNull();
  });
  it('shows the half-written first step and decodes escapes', () => {
    const cut = full.slice(0, full.indexOf('Get $2x') + 10);
    expect(previewAnswer(cut)).toEqual({ finalAnswer: 'x = 6', steps: [{ title: 'Subtract 5', body: 'Get $2x = ' }], summary: undefined });
  });
  it('never ends in half an escape and handles fences', () => {
    expect(previewAnswer('```json\n{"finalAnswer":"a\\')?.finalAnswer).toBe('a');
    expect(previewAnswer('{"finalAnswer":"caf\\u00e')?.finalAnswer).toBe('caf');
    expect(previewAnswer('{"finalAnswer":"q\\"r\\\\s"')?.finalAnswer).toBe('q"r\\s');
  });
  it('on the finished text it agrees with parseAnswer', () => {
    const p = previewAnswer(full)!, q = parseAnswer(full);
    expect(p.finalAnswer).toBe(q.finalAnswer);
    expect(p.steps).toEqual(q.steps);
    expect(p.summary).toBe(q.summary);
  });
});
