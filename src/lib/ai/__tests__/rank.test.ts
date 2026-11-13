import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/settings', () => ({ getSettings: () => ({ provider: 'gemini', model: 'gemini-2.0-flash', apiKey: 'AIzaOLD1234', baseUrl: '', proxyUrl: '' }) }));
import { classify } from '../fallback/classify';
import { defaultPick, isRetiredModel, rankModels, verifiedFirst } from '../fallback/rank';
import { migrate } from '../fallback/store';

describe('rankModels', () => {
  const list = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.8-flash-preview', 'gemini-3.8-flash-image', 'gemini-embedding-2', 'gemini-3.6-flash', 'gemini-2.5-flash-lite'];
  it('drops non-text models and puts previews last', () => {
    const r = rankModels(list);
    expect(r).not.toContain('gemini-3.8-flash-image');
    expect(r).not.toContain('gemini-embedding-2');
    expect(r[r.length - 1]).toBe('gemini-3.8-flash-preview');
    expect(r[0]).toBe('gemini-3.8-flash');
  });
  it('defaultPick keeps a short mix of flash and flash-lite', () => {
    const p = defaultPick(list);
    expect(p.slice(0, 2)).toEqual(['gemini-3.8-flash', 'gemini-3.6-flash']);
    expect(p).toContain('gemini-3.1-flash-lite');
  });
});

describe('classify', () => {
  it('maps the documented cases', () => {
    expect(classify(429, '').kind).toBe('quota');
    expect(classify(503, '').kind).toBe('transient');
    expect(classify(404, '').kind).toBe('unavailable');
    expect(classify(400, 'API key not valid').kind).toBe('badkey');
    expect(classify(403, '').kind).toBe('badkey');
    expect(classify(400, 'something else').kind).toBe('badrequest');
  });
});

describe('migrate', () => {
  it('keeps the old key and a still-existing model first, then adds the suggested chain', () => {
    const s = migrate({ provider: 'gemini', model: 'gemini-2.5-flash', apiKey: 'AIzaOLD1234' });
    expect(s.keys).toHaveLength(1);
    expect(s.chain[0].model).toBe('gemini-2.5-flash');
    expect(s.chain.length).toBeGreaterThan(3);
  });
  it('drops the retired gemini-2.0-flash so it never wastes a 404', () => {
    const s = migrate({ provider: 'gemini', model: 'gemini-2.0-flash', apiKey: 'AIzaOLD1234' });
    expect(s.keys).toHaveLength(1);
    expect(s.chain.map(c => c.model)).not.toContain('gemini-2.0-flash');
    expect(s.chain.length).toBeGreaterThan(3);
  });
  it('R5: the user\'s own model is kept but unverified; every guessed name is unverified too', () => {
    const s = migrate({ provider: 'gemini', model: 'gemini-2.5-flash', apiKey: 'AIzaOLD1234' });
    expect(s.chain[0]).toMatchObject({ model: 'gemini-2.5-flash', verified: false });
    expect(s.chain.every(c => c.verified === false)).toBe(true);
  });
  it('gives a new user an empty key pool and a suggested chain', () => {
    const s = migrate({ provider: 'anthropic', model: 'x', apiKey: '' });
    expect(s.keys).toHaveLength(0);
    expect(s.chain.every(c => c.provider === 'gemini')).toBe(true);
  });
});

describe('R5 verified before guessed', () => {
  it('verifiedFirst puts unverified last and keeps each group in order', () => {
    const r = verifiedFirst([{ m: 'g1', verified: false }, { m: 'v1' }, { m: 'g2', verified: false }, { m: 'v2', verified: true }]);
    expect(r.map(x => x.m)).toEqual(['v1', 'v2', 'g1', 'g2']);
  });
  it('knows which names Google retired', () => {
    expect(isRetiredModel('gemini-2.0-flash')).toBe(true);
    expect(isRetiredModel('gemini-1.5-pro')).toBe(true);
    expect(isRetiredModel('gemini-2.5-flash')).toBe(false);
  });
});
