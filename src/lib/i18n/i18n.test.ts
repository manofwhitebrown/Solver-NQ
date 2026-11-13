import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { en, type Key } from './locales/en';
import { LANGUAGES, LOADERS, getLanguage, initLanguage, languageInfo, setLanguage, t } from './index';

const keys = Object.keys(en) as Key[];
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('shipped languages', () => {
  it('ships Hindi, Telugu and Urdu', () => {
    expect(Object.keys(LOADERS).sort()).toEqual(['hi', 'te', 'ur']);
    expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'hi', 'te', 'ur']);
  });

  for (const [code, load] of Object.entries(LOADERS)) {
    describe(code, () => {
      it('has every key English has, and no extra keys', async () => {
        const d = (await load()) as Record<string, string>;
        const missing = keys.filter((k) => typeof d[k] !== 'string' || !d[k].trim());
        const extra = Object.keys(d).filter((k) => !(k in en));
        expect(missing, `missing in ${code}`).toEqual([]);
        expect(extra, `unknown keys in ${code}`).toEqual([]);
      });
      it('keeps the same {placeholders} as English', async () => {
        const d = (await load()) as Record<string, string>;
        for (const k of keys) expect(placeholders(d[k]), `${code}:${k}`).toBe(placeholders(en[k]));
      });
      it('is actually translated (not a copy of the English text)', async () => {
        const d = (await load()) as Record<string, string>;
        const same = keys.filter((k) => d[k] === en[k]);
        expect(same, `still English in ${code}`).toEqual([]);
      });
    });
  }
});

describe('t()', () => {
  // The test runner has no browser: give the module a tiny localStorage and <html> element.
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), clear: () => store.clear(),
    });
    vi.stubGlobal('document', { documentElement: { lang: '', dir: '' } });
  });
  afterEach(async () => { await setLanguage('en'); vi.unstubAllGlobals(); });

  it('returns English by default and fills {placeholders}', () => {
    expect(t('answer.askAgain')).toBe('Ask again');
    expect(t('export.count', { n: 3 })).toBe('3 answers');
    expect(t('export.build', { format: 'PDF' })).toBe('Export PDF');
  });
  it('falls back to the key for an unknown key and keeps unfilled placeholders', () => {
    expect(t('no.such.key' as Key)).toBe('no.such.key');
    expect(t('export.count')).toBe('{n} answers');
  });
  it('switches language, sets lang/dir on the page, and remembers the choice', async () => {
    await setLanguage('hi');
    expect(t('answer.askAgain')).toBe('दोबारा पूछें');
    expect(document.documentElement.lang).toBe('hi');
    expect(document.documentElement.dir).toBe('ltr');
    await setLanguage('ur');
    expect(languageInfo().dir).toBe('rtl');
    expect(document.documentElement.dir).toBe('rtl');
    expect(localStorage.getItem('solver-nq:lang')).toBe('ur');
  });
  it('restores the saved language on start-up, and uses English for junk values', async () => {
    localStorage.setItem('solver-nq:lang', 'te');
    await initLanguage();
    expect(getLanguage()).toBe('te');
    localStorage.setItem('solver-nq:lang', 'klingon');
    await initLanguage();
    expect(getLanguage()).toBe('en');
    expect(t('plan.today')).toBe('Today');
  });
  it('falls back to English for one missing key in a language', async () => {
    await setLanguage('hi');
    const mod = await import('./locales/hi');
    const saved = mod.hi['plan.week'];
    delete (mod.hi as Record<string, string>)['plan.week'];
    expect(t('plan.week')).toBe('This week');
    (mod.hi as Record<string, string>)['plan.week'] = saved;
  });
});
