import { defaultPick } from './rank';
import { newId } from '../id';
import { loadState, update } from './store';
import type { KeyEntry } from './types';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** ListModels with the user's key: only models that support generateContent. Never logs the key. */
export async function fetchGeminiModels(key: string, signal?: AbortSignal): Promise<string[]> {
  const out: string[] = [];
  let page = '';
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${BASE}/models?pageSize=200${page ? `&pageToken=${encodeURIComponent(page)}` : ''}`, {
      headers: { 'x-goog-api-key': key }, signal,
    });
    if (!res.ok) throw new Error(res.status === 400 || res.status === 403 || res.status === 401 ? 'bad_key' : 'failed');
    const json = (await res.json()) as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>; nextPageToken?: string };
    for (const m of json.models ?? []) {
      if (m.name && m.supportedGenerationMethods?.includes('generateContent')) out.push(m.name.replace(/^models\//, ''));
    }
    if (!json.nextPageToken) break;
    page = json.nextPageToken;
  }
  return out;
}

/** Add chosen models to the end of the chain (skipping ones already there). */
export function addModels(models: string[], provider: KeyEntry['provider'] = 'gemini', verified = true): void {
  update(s => {
    for (const model of models) {
      const have = s.chain.find(c => c.provider === provider && c.model === model);
      if (have) { if (verified && have.verified === false) have.verified = true; continue; }
      s.chain.push({ id: newId(), provider, model, keyId: '', enabled: true, verified });
    }
  });
}

/**
 * Check the Gemini slots against what Google really lists for this key. Listed names become verified;
 * guessed or migrated names that are not listed are removed; if nothing is left, the ranked defaults are added.
 * Quietly does nothing on any failure (offline, bad key): the chain just keeps its ordering rule.
 */
export async function verifyChain(signal?: AbortSignal): Promise<'verified' | 'skipped'> {
  const st = loadState();
  const key = st.keys.find(k => k.provider === 'gemini' && !st.invalidKeys.includes(k.id));
  if (!key || !st.chain.some(c => c.provider === 'gemini' && c.verified === false)) return 'skipped';
  try {
    const names = await fetchGeminiModels(key.key, signal);
    if (!names.length) return 'skipped'; // an empty or odd reply proves nothing: never wipe the chain on it
    const listed = new Set(names);
    update(s => {
      s.chain = s.chain.filter(c => c.provider !== 'gemini' || c.verified !== false || listed.has(c.model));
      for (const c of s.chain) if (c.provider === 'gemini' && listed.has(c.model)) c.verified = true;
    });
    if (!loadState().chain.some(c => c.provider === 'gemini')) addModels(defaultPick([...listed]));
    return 'verified';
  } catch { return 'skipped'; }
}

/**
 * After a key is first saved: fetch what Google actually offers and make that the chain
 * (replacing the untested suggested names). Quietly keeps the old chain if the call fails.
 */
export async function prefillChain(keyId: string): Promise<'filled' | 'kept'> {
  const k = loadState().keys.find(x => x.id === keyId);
  if (!k || k.provider !== 'gemini') return 'kept';
  try {
    const pick = defaultPick(await fetchGeminiModels(k.key));
    if (!pick.length) return 'kept';
    update(s => {
      s.chain = s.chain.filter(c => c.provider !== 'gemini');
      s.fetchedFor.push(keyId);
    });
    addModels(pick);
    return 'filled';
  } catch { return 'kept'; }
}
