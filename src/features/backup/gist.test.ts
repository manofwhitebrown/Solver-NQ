import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { disconnectGist, gistId, pullFromGist, pushToGist, setGistToken } from './gist';
import { exportBackup } from '@/lib/db';

const store: Record<string, string> = {};
beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  vi.stubGlobal('localStorage', { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } });
});

describe('gist sync', () => {
  it('refuses without a token', async () => { expect((await pushToGist()).ok).toBe(false); });
  it('creates a private gist, remembers its id, keeps the token out of the payload', async () => {
    setGistToken('ghp_secret');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: 'abc123' }) });
    vi.stubGlobal('fetch', fetchMock);
    expect((await pushToGist()).ok).toBe(true);
    expect(gistId()).toBe('abc123');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.public).toBe(false);
    expect(JSON.stringify(body)).not.toContain('ghp_secret');
    expect(await exportBackup()).not.toContain('ghp_secret');
  });
  it('maps a 401 to a clear message', async () => {
    setGistToken('bad');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    expect((await pushToGist()).message).toMatch(/rejected/);
  });
  it('pull merges the gist content', async () => {
    setGistToken('t'); store['solver-nq-gist-id'] = 'abc123';
    const content = await exportBackup({ images: false });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ files: { 'solver-nq-library.json': { content } } }) }));
    expect((await pullFromGist()).ok).toBe(true);
  });
  it('disconnect clears token and id', () => { setGistToken('x'); disconnectGist(); expect(gistId()).toBe(''); });
});
