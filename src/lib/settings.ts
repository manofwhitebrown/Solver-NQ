import { useSyncExternalStore } from 'react';
import type { Mode, Subject } from '@/types';

export type Provider = 'anthropic' | 'openai' | 'gemini';
export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  provider: Provider;
  model: string;
  apiKey: string; // stays on this device. Never log it.
  baseUrl: string; // for OpenAI-compatible servers; empty = provider default
  proxyUrl: string; // optional; empty = call the provider directly
  theme: ThemePref;
  defaultSubject: Subject;
  defaultMode: Mode;
  ocrLang: string; // Tesseract-style code, e.g. 'eng'
  onboarded: boolean; // first-run welcome finished or skipped
}

export const SUGGESTED_MODELS: Record<Provider, string> = {
  anthropic: 'claude-sonnet-4-5',
  openai: 'gpt-4o-mini',
  gemini: 'gemini-2.0-flash',
};

export const DEFAULT_SETTINGS: Settings = {
  provider: 'gemini',
  model: SUGGESTED_MODELS.gemini,
  apiKey: '',
  baseUrl: '',
  proxyUrl: '',
  theme: 'system',
  defaultSubject: 'math',
  defaultMode: 'learn',
  ocrLang: 'eng',
  onboarded: false,
};

const KEY = 'solver-nq:settings';
const listeners = new Set<() => void>();

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // People who already set a key before onboarding existed skip it.
      return { ...DEFAULT_SETTINGS, ...(saved.apiKey && saved.onboarded === undefined ? { onboarded: true } : {}), ...saved };
    }
  } catch {
    /* storage can be blocked or corrupted: fall back to defaults */
  }
  return { ...DEFAULT_SETTINGS };
}

let current: Settings = load();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* ignore: settings still work for this session */
  }
  listeners.forEach((l) => l());
}

export function resetSettings(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  current = { ...DEFAULT_SETTINGS };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
