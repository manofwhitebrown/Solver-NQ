import { describe, expect, it } from 'vitest';
import { capText, MAX_CHARS } from './limit';
import { cheatSheet, keywords, summarize } from './extractive';
import { extractGlossary } from './glossary';
import { splitSentences } from './sentences';

const TEXT = `Photosynthesis is the process plants use to turn light into chemical energy. It happens in the chloroplasts of leaf cells. ` +
  `Chlorophyll is the green pigment that absorbs light. The light reactions make ATP and NADPH. The Calvin cycle uses ATP to fix carbon dioxide into sugar. ` +
  `Plants also release oxygen as a by-product of photosynthesis. Weather today was sunny. Photosynthesis rates depend on light, carbon dioxide and temperature. ` +
  `Stomata are small pores that let carbon dioxide enter the leaf. Water is split during the light reactions to supply electrons.`;

describe('splitSentences', () => {
  it('keeps abbreviations and decimals together', () => {
    expect(splitSentences('Use e.g. water at 3.5 g. Then stop. Done.')).toHaveLength(2 + 1);
  });
});
describe('summarize', () => {
  it('returns fewer sentences for short than detailed, in original order', () => {
    const s = summarize(TEXT, 'short'), d = summarize(TEXT, 'detailed');
    expect(splitSentences(s).length).toBeLessThan(splitSentences(d).length);
    expect(d.indexOf('Photosynthesis is')).toBeLessThan(d.indexOf('Stomata'));
  });
  it('returns short text unchanged and handles empty', () => {
    expect(summarize('One sentence only.')).toBe('One sentence only.');
    expect(summarize('')).toBe('');
  });
  it('keywords skip stop words', () => {
    const k = keywords(TEXT, 5);
    expect(k).toContain('photosynthesis');
    expect(k).not.toContain('the');
  });
  it('cheat sheet is markdown with headings and bullets', () => {
    const c = cheatSheet(TEXT, 'Plants');
    expect(c).toMatch(/^# Plants/);
    expect(c).toContain('## Main points');
    expect(c).toMatch(/^- /m);
  });
});
describe('extractGlossary', () => {
  it('finds "X is ..." and "X: ..." definitions without duplicates', () => {
    const g = extractGlossary(TEXT + '\nATP: the energy currency of the cell\n- **Stomata** - pores in the leaf surface');
    const terms = g.map((x) => x.term.toLowerCase());
    expect(terms).toContain('chlorophyll');
    expect(terms).toContain('atp');
    expect(terms.filter((t) => t === 'stomata')).toHaveLength(1);
  });
  it('ignores pronoun starts', () => { expect(extractGlossary('It is a thing that exists somewhere.')).toEqual([]); });
});
describe('capText', () => {
  it('leaves short text alone', () => { expect(capText('hello').truncated).toBe(false); });
  it('cuts at a sentence end and reports the total', () => {
    const long = 'Sentence number one is here. '.repeat(3000);
    const c = capText(long);
    expect(c.truncated).toBe(true);
    expect(c.total).toBeGreaterThan(MAX_CHARS);
    expect(c.text.length).toBeLessThanOrEqual(MAX_CHARS);
    expect(c.text.endsWith('.')).toBe(true);
  });
});

describe('transform wrapper', () => {
  it('puts the summary length in front of the text and returns trimmed markdown', async () => {
    const { vi } = await import('vitest');
    vi.resetModules();
    const calls: string[] = [];
    vi.doMock('@/lib/ai', () => ({ transformText: async (_k: string, t: string) => { calls.push(t); return '  ## Hi  '; } }));
    const { transform } = await import('./ai');
    expect(await transform('summary', 'body text', { length: 'short' })).toBe('## Hi');
    expect(calls[0]).toContain('SHORT');
    expect(calls[0]).toContain('body text');
    vi.doUnmock('@/lib/ai');
  });
});
