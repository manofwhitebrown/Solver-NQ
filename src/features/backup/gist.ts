import { exportBackup, importBackup, type ImportResult } from '@/lib/db';

// The GitHub token and gist id live in localStorage on purpose: the database is part of every
// backup file, and a token must never end up inside a backup or a synced gist.
const TOKEN_KEY = 'solver-nq-gist-token';
const ID_KEY = 'solver-nq-gist-id';
const FILE = 'solver-nq-library.json';
const API = 'https://api.github.com/gists';

const read = (k: string) => { try { return localStorage.getItem(k) ?? ''; } catch { return ''; } };
const write = (k: string, v: string) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch { /* storage blocked */ } };

export const gistToken = () => read(TOKEN_KEY);
export const gistId = () => read(ID_KEY);
export const setGistToken = (t: string) => write(TOKEN_KEY, t.trim());
export const setGistId = (id: string) => write(ID_KEY, id.trim());
export const disconnectGist = () => { write(TOKEN_KEY, ''); write(ID_KEY, ''); };

export interface SyncResult { ok: boolean; message: string; added?: number }

const headers = (token: string) => ({ Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' });

function failure(status: number): string {
  if (status === 401) return 'GitHub rejected the token. Check it has the "gist" permission.';
  if (status === 403 || status === 429) return 'GitHub is limiting requests right now. Try again in a few minutes.';
  if (status === 404) return 'That gist was not found for this token.';
  return `GitHub answered with an error (${status}).`;
}

/** Upload the library (questions, answers, cards, notes; images stay on the device) to a private gist. */
export async function pushToGist(): Promise<SyncResult> {
  const token = gistToken();
  if (!token) return { ok: false, message: 'Add a GitHub token first.' };
  try {
    const content = await exportBackup({ images: false });
    const id = gistId();
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? 'PATCH' : 'POST', headers: headers(token),
      body: JSON.stringify({ description: 'Solver-NQ library', public: false, files: { [FILE]: { content } } }),
    });
    if (!res.ok) return { ok: false, message: failure(res.status) };
    const json = (await res.json()) as { id?: string };
    if (json.id) setGistId(json.id);
    return { ok: true, message: 'Library uploaded to your private gist.' };
  } catch { return { ok: false, message: 'Could not reach GitHub. Check your connection.' }; }
}

/** Download the gist and merge it in (never overwrites what is on this device). */
export async function pullFromGist(): Promise<SyncResult> {
  const token = gistToken(); const id = gistId();
  if (!token) return { ok: false, message: 'Add a GitHub token first.' };
  if (!id) return { ok: false, message: 'Nothing uploaded yet. Upload from your other device first, or paste its gist id.' };
  try {
    const res = await fetch(`${API}/${id}`, { headers: headers(token) });
    if (!res.ok) return { ok: false, message: failure(res.status) };
    const gist = (await res.json()) as { files?: Record<string, { content?: string; truncated?: boolean; raw_url?: string }> };
    const f = gist.files?.[FILE];
    if (!f) return { ok: false, message: 'That gist has no Solver-NQ library in it.' };
    let text = f.content ?? '';
    if (f.truncated && f.raw_url) {
      const raw = await fetch(f.raw_url, { headers: { Authorization: `Bearer ${token}` } });
      if (!raw.ok) return { ok: false, message: failure(raw.status) };
      text = await raw.text();
    }
    const r: ImportResult = await importBackup(text);
    return r.error ? { ok: false, message: r.error } : { ok: true, added: r.added, message: `Synced. ${r.added} added, ${r.skipped} already here.` };
  } catch { return { ok: false, message: 'Could not reach GitHub. Check your connection.' }; }
}
