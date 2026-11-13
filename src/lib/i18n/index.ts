import { useSyncExternalStore } from 'react';
import { en, type Dict, type Key } from './locales/en';

export type { Key } from './locales/en';
export type LangCode = 'en' | 'hi' | 'te' | 'ur';
export interface Language { code: LangCode; name: string; native: string; dir: 'ltr' | 'rtl' }

/** Shipped languages. `native` is the name written in that language, shown in the picker. */
export const LANGUAGES: readonly Language[] = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
];

/** Each language is its own small chunk, loaded only when chosen. English is always in the app. */
export const LOADERS: Record<Exclude<LangCode, 'en'>, () => Promise<Dict>> = {
  hi: async () => (await import('./locales/hi')).hi,
  te: async () => (await import('./locales/te')).te,
  ur: async () => (await import('./locales/ur')).ur,
};

const STORAGE_KEY = 'solver-nq:lang';
let current: LangCode = 'en';
let dict: Dict = en;
const listeners = new Set<() => void>();

const isLang = (c: unknown): c is LangCode => LANGUAGES.some((l) => l.code === c);
export const languageInfo = (code: LangCode = current): Language => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
export const getLanguage = (): LangCode => current;

/** Looks up a string; a key missing in the chosen language falls back to English, then to the key itself. */
export function t(key: Key, params?: Record<string, string | number>): string {
  const raw = (dict as Partial<Dict>)[key] ?? en[key] ?? key;
  return params ? raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m)) : raw;
}

function apply(code: LangCode) {
  current = code;
  if (code === 'en') dict = en; // English also resets the strings, so a fallback never keeps an old language's words
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code;
    document.documentElement.dir = languageInfo(code).dir; // right-to-left for Urdu
  }
  listeners.forEach((l) => l());
}

/** Switches language (loading its strings first) and remembers the choice. A failed load keeps the current language. */
export async function setLanguage(code: LangCode): Promise<void> {
  if (!isLang(code)) return;
  const next = code === 'en' ? en : await LOADERS[code]();
  dict = next;
  apply(code);
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* private mode: the choice just is not remembered */ }
}

/** Call once at start-up: restores the saved language, English when nothing was chosen. */
export async function initLanguage(): Promise<void> {
  let saved: string | null = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
  if (isLang(saved) && saved !== 'en') {
    try { await setLanguage(saved); } catch { apply('en'); }
  } else apply('en');
}

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/** React hook: re-renders when the language changes. Returns the current `t` and language code. */
export function useT(): { t: typeof t; lang: LangCode } {
  const lang = useSyncExternalStore(subscribe, getLanguage, getLanguage);
  return { t, lang };
}
