import { getSettings } from '@/lib/settings';
import { newId } from '../id';
import { SUGGESTED_MODELS, isRetiredModel, verifiedFirst } from './rank';
import type { Cooldown, FallbackState, KeyEntry, ModelSlot, SlotProvider } from './types';

const KEY = 'solvernq.ai.v2';
const listeners = new Set<() => void>();
let cache: FallbackState | null = null;

function suggestedChain(keyId = ''): ModelSlot[] {
  return SUGGESTED_MODELS.map(model => ({ id: newId(), provider: 'gemini', model, keyId, enabled: true, verified: false }));
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
    // Keep the user's own model (unless Google retired it), but unverified: it only stays if ListModels shows it.
    if (model && !(provider === 'gemini' && isRetiredModel(model))) s.chain.push({ id: newId(), provider, model, keyId: '', enabled: true, verified: provider === 'gemini' ? false : undefined });
    if (provider === 'gemini') s.chain.push(...suggestedChain().filter(x => x.model !== model));
  } else {
    s.chain = suggestedChain();
  }
  if (apiKey) s.legacySeen = `${apiKey.length}:${apiKey.slice(-4)}`;
  return s;
}

/** A saved value from an older/partial/corrupted write must never crash the app: keep what is valid, default the rest. */
function sanitize(v: unknown): FallbackState | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Partial<FallbackState>;
  if (!Array.isArray(o.keys) || !Array.isArray(o.chain)) return null;
  const base = migrate({});
  const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object';
  return {
    ...base,
    ...o,
    version: 1,
    keys: o.keys.filter((k) => isObj(k) && typeof k.id === 'string' && typeof k.key === 'string' && typeof k.provider === 'string').map((k) => ({ ...k, label: typeof k.label === 'string' ? k.label : 'My key' })),
    chain: o.chain.filter((c) => isObj(c) && typeof c.model === 'string' && typeof c.provider === 'string').map((c) => ({ ...c, enabled: c.enabled !== false, keyId: typeof c.keyId === 'string' ? c.keyId : '' })),
    cooldowns: isObj(o.cooldowns) ? (o.cooldowns as FallbackState['cooldowns']) : {},
    invalidKeys: Array.isArray(o.invalidKeys) ? o.invalidKeys : [],
    fetchedFor: Array.isArray(o.fetchedFor) ? o.fetchedFor : [],
    saveQuota: typeof o.saveQuota === 'boolean' ? o.saveQuota : base.saveQuota,
    perMinute: typeof o.perMinute === 'number' && o.perMinute > 0 ? o.perMinute : base.perMinute,
  };
}

export function loadState(): FallbackState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const ok = sanitize(JSON.parse(raw)); if (ok) { cache = ok; return cache; } }
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
  return verifiedFirst(loadState().chain.filter(c => c.enabled))[0]?.model;
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
      if (model && !(provider === 'gemini' && isRetiredModel(model))) st.chain.unshift({ id: newId(), provider, model, keyId: '', enabled: true, verified: provider === 'gemini' ? false : undefined });
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
