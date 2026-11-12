import type { KeyEntry } from './types';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** Cheap check: does this key work at all? (ListModels costs no generation quota.) */
export async function testKey(k: Pick<KeyEntry, 'provider' | 'key' | 'baseUrl'>): Promise<{ ok: boolean; message: string }> {
  try {
    const url = k.provider === 'gemini' ? `${BASE}/models?pageSize=1` : `${(k.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/models`;
    const headers: Record<string, string> = k.provider === 'gemini' ? { 'x-goog-api-key': k.key } : { Authorization: `Bearer ${k.key}` };
    const res = await fetch(url, { headers });
    if (res.ok) return { ok: true, message: 'Key works.' };
    if (res.status === 400 || res.status === 401 || res.status === 403) return { ok: false, message: 'That key was rejected. Check that you copied all of it.' };
    return { ok: false, message: 'The service had a problem. Try again in a moment.' };
  } catch {
    return { ok: false, message: navigator.onLine ? 'Could not reach the service from this browser.' : "You're offline." };
  }
}
