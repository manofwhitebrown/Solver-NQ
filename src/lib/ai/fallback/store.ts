import { getSettings } from '@/lib/settings';
import { newId } from '../id';
import { SUGGESTED_MODELS } from './rank';
import type { Cooldown, FallbackState, KeyEntry, ModelSlot, SlotProvider } from './types';

const KEY = 'solvernq.ai.v2';
const listeners = new Set<() => void>();
let cache: FallbackState | null = null;

function suggestedChain(keyId = ''): ModelSlot[] {
  return SUGGESTED_MODELS.map(model => ({ id: newId(), provider: 'gemini', model, keyId, enabled: true }));
}

/** First load: fold the old single provider/model/apiKey settings into the pool. No data is lost. */
export function migrate(old: { provider?: string; model?: string; apiKey?: string; baseUrl?: string }): FallbackState {
  const s: FallbackState = { version: 1, keys: [], chain: [], cooldowns: {}, invalidKeys: [], saveQuota: false, perMinute: 10, fetchedFor: [] };
  const provider = (['gemini', 'openai', 'anthropic'].includes(old.provider ?? '') ? old.provider : 'gemini') as SlotProvider;
  const apiKey = (old.apiKey ?? '').trim();
  if (apiKey) {
    const k: KeyEntry = { id: newId(), provider, label: 'My key', key: apiKey, baseUrl: old.baseUrl?.trim() || undefined };
    s.keys.push(k);
    const model = (old.model ?? '').trim();
    // Keep the user's own model first; add the suggested Gemini chain behind it if they were on Gemini.
    if (model) s.chain.push({ id: newId(), provider, model, keyId: '', enabled: true });
    if (provider === 'gemini') s.chain.push(...suggestedChain().filter(x => x.model !== model));
  } else {
    s.chain = suggestedChain();
  }
  if (apiKey) s.legacySeen = `${apiKey.length}:${apiKey.slice(-4)}`;
  return s;
}

export function loadState(): FallbackState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { cache = JSON.parse(raw) as FallbackState; return cache; }
  } catch { /* fall through to migration */ }
  let old = {};
  try { old = getSettings(); } catch { /* settings not ready */ }
  cache = migrate(old);
  persist();
  return cache;
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* storage full or blocked */ }
}

export function update(fn: (s: FallbackState) => FallbackState | void): void {
  const cur = loadState();
  cache = fn(cur) ?? cur;
  persist();
  listeners.forEach(l => l());
}

export const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const resetCache = () => { cache = null; }; // tests: simulate a page reload

export const maskKey = (k: string) => (k.length <= 4 ? '••••' : `••••${k.slice(-4)}`);
/** Quota is per project: same label = same project. */
export const projectOf = (k: KeyEntry) => (k.label.trim().toLowerCase() || k.id);
export const cooldownId = (k: KeyEntry, model: string) => `${projectOf(k)}|${model}`;

export function activeCooldown(s: FallbackState, k: KeyEntry, model: string, now: number): Cooldown | undefined {
  const c = s.cooldowns[cooldownId(k, model)];
  return c && c.until > now ? c : undefined;
}

/** First enabled model in the chain, or undefined. AI-5 uses this to detect a fallback answer. */
export function getPrimaryModel(): string | undefined {
  return loadState().chain.find(c => c.enabled)?.model;
}

export function earliestRetry(now = Date.now()): number | undefined {
  const times = Object.values(loadState().cooldowns).filter(c => c.kind === 'cooldown' && c.until > now).map(c => c.until);
  return times.length ? Math.min(...times) : undefined;
}

const fingerprint = (k: string) => `${k.length}:${k.slice(-4)}`;

/** The old Settings screen may still hold a key the pool has not seen: import it once. */
export function importLegacy(): void {
  let old: { provider?: string; model?: string; apiKey?: string; baseUrl?: string } = {};
  try { old = getSettings(); } catch { return; }
  const apiKey = (old.apiKey ?? '').trim();
  const s = loadState();
  if (!apiKey || s.legacySeen === fingerprint(apiKey) || s.keys.some(k => k.key === apiKey)) return;
  const provider = (['gemini', 'openai', 'anthropic'].includes(old.provider ?? '') ? old.provider : 'gemini') as SlotProvider;
  update(st => {
    st.keys.push({ id: newId(), provider, label: 'My key', key: apiKey, baseUrl: old.baseUrl?.trim() || undefined });
    st.legacySeen = fingerprint(apiKey);
    if (!st.chain.some(c => c.provider === provider)) {
      const model = (old.model ?? '').trim();
      if (model) st.chain.unshift({ id: newId(), provider, model, keyId: '', enabled: true });
    }
  });
}

// ---- chain editing (used by the settings panel) ----
export function moveSlot(id: string, dir: -1 | 1): void {
  update(s => {
    const i = s.chain.findIndex(c => c.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= s.chain.length) return;
    [s.chain[i], s.chain[j]] = [s.chain[j], s.chain[i]];
  });
}
export const toggleSlot = (id: string) => update(s => { const c = s.chain.find(x => x.id === id); if (c) c.enabled = !c.enabled; });
export const removeSlot = (id: string) => update(s => { s.chain = s.chain.filter(c => c.id !== id); });
export const resetCooldowns = () => update(s => { s.cooldowns = {}; });
export const setSaveQuota = (v: boolean) => update(s => { s.saveQuota = v; });
