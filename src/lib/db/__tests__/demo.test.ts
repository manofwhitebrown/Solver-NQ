import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db';
import { resetIndex } from '../search';
import { listLibrary, search } from '../store';
import { listNotes } from '../notes';
import { kvGet } from '../kv';
import { DEMO_IDS, DEMO_STUDY_PLAN_KEY, seedDemoData } from '../demo';

beforeEach(async () => {
  await Promise.all(db.tables.map(t => t.clear()));
  resetIndex();
  vi.unstubAllEnvs();
});

describe('seedDemoData', () => {
  it('creates the demo content and is idempotent', async () => {
    vi.stubEnv('VITE_DEMO', '1');
    const ids = await seedDemoData();
    expect(ids).toEqual(DEMO_IDS);
    const lib = await listLibrary({});
    expect(lib.length).toBe(14);
    expect(lib.every(i => i.a)).toBe(true);
    expect(new Set(lib.map(i => i.a!.mode))).toEqual(new Set(['learn', 'answer']));
    expect(new Set(lib.map(i => i.a!.verified))).toEqual(new Set(['match', 'mismatch', 'unchecked']));
    expect(lib.some(i => i.q.starred)).toBe(true);
    expect(await db.answers.get(DEMO_IDS.learn)).toBeTruthy();
    expect(await db.answers.get(DEMO_IDS.answer)).toBeTruthy();
    expect((await db.flashcards.toArray()).filter(c => c.due <= Date.now()).length).toBeGreaterThan(0);
    expect((await listNotes()).length).toBe(3);
    expect(await kvGet(DEMO_STUDY_PLAN_KEY)).toBeTruthy();
    expect((await search('binomial')).length).toBe(1);
    const counts = await Promise.all([db.questions.count(), db.answers.count(), db.flashcards.count()]);
    await seedDemoData();
    expect(await Promise.all([db.questions.count(), db.answers.count(), db.flashcards.count()])).toEqual(counts);
  });

  it('includes the layout edge cases', async () => {
    vi.stubEnv('VITE_DEMO', '1');
    await seedDemoData();
    const texts = (await db.questions.toArray()).map(q => q.text);
    expect(texts.some(t => /\S{100,}/.test(t))).toBe(true);
    expect(texts.some(t => t.split('\n').length >= 5)).toBe(true);
    const bodies = (await db.answers.toArray()).flatMap(a => a.steps.map(s => s.body));
    expect(bodies.some(b => b.includes('b^{10}') && b.length > 100)).toBe(true);
    expect(bodies.some(b => b.split('\n').some(l => l.length >= 100 && !l.startsWith('$')))).toBe(true);
  });

  it('does nothing in a normal production build', async () => {
    vi.stubEnv('VITE_DEMO', '');
    vi.stubEnv('DEV', false);
    expect(await seedDemoData()).toBeNull();
    expect(await db.questions.count()).toBe(0);
  });
});
