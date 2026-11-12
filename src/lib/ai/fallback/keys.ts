import { newId } from '../id';
import { loadState, update } from './store';
import type { KeyEntry, SlotProvider } from './types';

export function addKey(input: { provider: SlotProvider; key: string; label?: string; baseUrl?: string }): KeyEntry {
  const key = input.key.trim();
  const n = loadState().keys.filter(k => k.provider === input.provider).length + 1;
  const entry: KeyEntry = {
    id: newId(), provider: input.provider, key,
    label: input.label?.trim() || `Project ${String.fromCharCode(64 + Math.min(n, 26))}`,
    baseUrl: input.baseUrl?.trim() || undefined,
  };
  update(s => { s.keys.push(entry); });
  return entry;
}

export function removeKey(id: string): void {
  update(s => { s.keys = s.keys.filter(k => k.id !== id); s.invalidKeys = s.invalidKeys.filter(x => x !== id); });
}

export function renameKey(id: string, label: string): void {
  update(s => { const k = s.keys.find(x => x.id === id); if (k) k.label = label.trim() || k.label; });
}

/** User pasted a fixed key: forget that it was rejected. */
export function clearInvalid(id: string): void {
  update(s => { s.invalidKeys = s.invalidKeys.filter(x => x !== id); });
}

export const hasAnyKey = () => loadState().keys.length > 0;
