import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/settings', () => ({ getSettings: () => ({ provider: 'gemini', model: '', apiKey: '', baseUrl: '', proxyUrl: '' }) }));

import { AiError } from '../errors';
import { callWithFallback } from '../fallback/callWithFallback';
import { cooldownUntil, nextPacificMidnight } from '../fallback/classify';
import { loadState, resetCache } from '../fallback/store';
import { resetThrottle } from '../fallback/throttle';
import type { FallbackState } from '../fallback/types';

const mem = new Map<string, string>();
const fetchMock = vi.fn();
const SECRET1 = 'AIzaSECRETKEY111111';
const SECRET2 = 'AIzaSECRETKEY222222';
const NOW = Date.UTC(2026, 10, 12, 20, 0, 0); // 12:00 Pacific

function seed(keys: Array<[string, string]>, models: string[]) {
  const s: FallbackState = {
    version: 1, saveQuota: false, perMinute: 100, cooldowns: {}, invalidKeys: [], fetchedFor: [], legacySeen: 'x',
    keys: keys.map(([id, label], i) => ({ id, provider: 'gemini' as const, label, key: i === 0 ? SECRET1 : SECRET2 })),
    chain: models.map((model, i) => ({ id: `s${i}`, provider: 'gemini' as const, model, keyId: '', enabled: true })),
  };
  mem.set('solvernq.ai.v2', JSON.stringify(s));
  resetCache();
}
const ok = (text = 'hi') => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }), text: async () => '' });
const fail = (status: number, body = '') => ({ ok: false, status, text: async () => body, json: async () => ({}) });
const req = { system: 's', messages: [{ role: 'user' as const, content: 'q' }] };
const opts = { now: () => NOW, sleep: async () => {} };
const calledModels = () => fetchMock.mock.calls.map(c => /models\/([^:]+):/.exec(String(c[0]))?.[1]);

beforeEach(() => {
  mem.clear(); fetchMock.mockReset(); resetThrottle();
  vi.stubGlobal('localStorage', { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v); } });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('callWithFallback', () => {
  it('429 puts the slot in cooldown and moves to the next model', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(429, '{"error":{"status":"RESOURCE_EXHAUSTED"}}')).mockResolvedValueOnce(ok('from b'));
    const r = await callWithFallback(req, opts);
    expect(r).toMatchObject({ text: 'from b', model: 'm-b', usedFallback: true });
    expect(loadState().cooldowns['a|m-a']).toMatchObject({ kind: 'cooldown', until: NOW + 60_000 });
  });

  it('uses the retryDelay from the error body', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(429, '{"details":[{"retryDelay":"33s"}]}')).mockResolvedValueOnce(ok());
    await callWithFallback(req, opts);
    expect(loadState().cooldowns['a|m-a'].until).toBe(NOW + 33_000);
  });

  it('a daily-quota message cools down until midnight Pacific', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(429, 'Quota exceeded for metric GenerateRequestsPerDayPerProjectPerModel')).mockResolvedValueOnce(ok());
    await callWithFallback(req, opts);
    const until = loadState().cooldowns['a|m-a'].until;
    expect(until).toBe(nextPacificMidnight(NOW));
    expect(until - NOW).toBeGreaterThan(11 * 3_600_000); // 12:00 Pacific -> ~12h
    expect(until - NOW).toBeLessThan(13 * 3_600_000);
  });

  it('503 retries once, then moves on without a long cooldown', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(503)).mockResolvedValueOnce(fail(503)).mockResolvedValueOnce(ok('b'));
    const r = await callWithFallback(req, opts);
    expect(calledModels()).toEqual(['m-a', 'm-a', 'm-b']);
    expect(r.model).toBe('m-b');
    expect(loadState().cooldowns['a|m-a'].until).toBe(NOW + 30_000);
  });

  it('a network error is treated like a 5xx', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockRejectedValueOnce(new TypeError('failed')).mockRejectedValueOnce(new TypeError('failed')).mockResolvedValueOnce(ok());
    expect((await callWithFallback(req, opts)).model).toBe('m-b');
  });

  it('404 marks the slot unavailable and moves on', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(404, 'model not found')).mockResolvedValueOnce(ok());
    await callWithFallback(req, opts);
    expect(loadState().cooldowns['a|m-a'].kind).toBe('unavailable');
  });

  it('limit: 0 also means unavailable', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(429, 'quota exceeded, limit: 0')).mockResolvedValueOnce(ok());
    await callWithFallback(req, opts);
    expect(loadState().cooldowns['a|m-a'].kind).toBe('unavailable');
  });

  it('an invalid key does not fall through to the next model', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(400, 'API key not valid. Please pass a valid API key.'));
    await expect(callWithFallback(req, opts)).rejects.toMatchObject({ code: 'bad_key' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(loadState().invalidKeys).toEqual(['k1']);
  });

  it('an invalid key only skips that key; the other key still answers', async () => {
    seed([['k1', 'A'], ['k2', 'B']], ['m-a']);
    fetchMock.mockResolvedValueOnce(fail(403, 'PERMISSION_DENIED')).mockResolvedValueOnce(ok('via key 2'));
    const r = await callWithFallback(req, opts);
    expect(r).toMatchObject({ text: 'via key 2', keyId: 'k2' });
    // and the bad key is skipped from then on
    fetchMock.mockResolvedValueOnce(ok());
    await callWithFallback(req, opts);
    expect(fetchMock.mock.calls[2][1].headers['x-goog-api-key']).toBe(SECRET2);
  });

  it('a safety block is shown, not retried elsewhere', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ promptFeedback: { blockReason: 'SAFETY' } }), text: async () => '' });
    await expect(callWithFallback(req, opts)).rejects.toMatchObject({ code: 'blocked' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rotates across keys of different projects within a model', async () => {
    seed([['k1', 'A'], ['k2', 'B']], ['m-a']);
    fetchMock.mockResolvedValue(ok());
    await callWithFallback(req, opts);
    await callWithFallback(req, opts);
    const used = fetchMock.mock.calls.map(c => c[1].headers['x-goog-api-key']);
    expect(new Set(used).size).toBe(2);
  });

  it('keys with the same project label share one quota', async () => {
    seed([['k1', 'Same'], ['k2', 'Same']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(429, 'quota')).mockResolvedValueOnce(ok());
    const r = await callWithFallback(req, opts);
    expect(r.model).toBe('m-b'); // second key was skipped for m-a: same project
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('when every slot fails it throws "exhausted" with a retry time', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValue(fail(429, 'quota'));
    const e = (await callWithFallback(req, opts).catch(x => x)) as AiError;
    expect(e.code).toBe('exhausted');
    expect(e.retryable).toBe(true);
    expect(e.retryAt).toBe(NOW + 60_000);
  });

  it('cooldowns survive a reload and the cooling slot is skipped', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(429, 'quota')).mockResolvedValueOnce(ok());
    await callWithFallback(req, opts);
    resetCache(); // simulate a page reload: state comes back from storage
    fetchMock.mockReset().mockResolvedValue(ok());
    await callWithFallback(req, opts);
    expect(calledModels()).toEqual(['m-b']);
  });

  it('throws no_key when the pool is empty', async () => {
    seed([], ['m-a']);
    await expect(callWithFallback(req, opts)).rejects.toMatchObject({ code: 'no_key' });
  });

  it('never leaks a key in error messages or logs', async () => {
    const spies = (['log', 'warn', 'error', 'info', 'debug'] as const).map(m => vi.spyOn(console, m).mockImplementation(() => {}));
    seed([['k1', 'A'], ['k2', 'B']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValue(fail(429, `quota exceeded for key ${SECRET1}`));
    const e1 = (await callWithFallback(req, opts).catch(x => x)) as Error;
    seed([['k1', 'A']], ['m-a']);
    fetchMock.mockReset().mockResolvedValue(fail(400, `API key not valid: ${SECRET1}`));
    const e2 = (await callWithFallback(req, opts).catch(x => x)) as Error;
    for (const e of [e1, e2]) { expect(e.message).not.toContain('AIza'); expect(String(e.stack)).not.toContain('AIza'); }
    expect(JSON.stringify(spies.map(s => s.mock.calls))).not.toContain('AIza');
    spies.forEach(s => s.mockRestore());
  });
});

describe('image-only calls', () => {
  it('skips a model that rejects images instead of dropping the image', async () => {
    seed([['k1', 'A']], ['m-a', 'm-b']);
    fetchMock.mockResolvedValueOnce(fail(400, 'Image input is not supported')).mockResolvedValueOnce(ok('text from image'));
    const r = await callWithFallback({ ...req, imageDataUrl: 'data:image/png;base64,AAAA' }, { ...opts, requireImage: true });
    expect(r.model).toBe('m-b');
    expect(String(fetchMock.mock.calls[1][1].body)).toContain('inlineData');
  });
});

describe('cooldown math', () => {
  it('defaults to 60 s', () => expect(cooldownUntil({ kind: 'quota' }, 1000)).toBe(61_000));
  it('midnight Pacific is within 24 h', () => {
    const d = nextPacificMidnight(NOW) - NOW;
    expect(d).toBeGreaterThan(0); expect(d).toBeLessThanOrEqual(24 * 3_600_000 + 1000);
  });
});
