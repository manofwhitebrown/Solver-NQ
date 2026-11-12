import 'fake-indexeddb/auto';
import { beforeAll, expect, it } from 'vitest';
import type { Answer, Question } from '@/types';
import { db } from '../db';
import { resetIndex } from '../search';
import { listLibrary, search } from '../store';

const N = 2000;

beforeAll(async () => {
  const qs: Question[] = [];
  const as: Answer[] = [];
  for (let i = 0; i < N; i++) {
    qs.push({ id: `q${i}`, text: `Find the value number ${i} of the series`, subject: i % 2 ? 'math' : 'physics', tags: [`t${i % 10}`], starred: i % 7 === 0, createdAt: i });
    as.push({ id: `a${i}`, questionId: `q${i}`, mode: 'learn', finalAnswer: `result ${i}`, steps: [], verified: 'unchecked', model: 'm', createdAt: i });
  }
  await db.questions.bulkPut(qs);
  await db.answers.bulkPut(as);
  resetIndex();
});

it('lists and searches 2000 items quickly and newest first', async () => {
  let t = performance.now();
  const all = await listLibrary({});
  expect(all.length).toBe(N);
  expect(all[0].q.id).toBe(`q${N - 1}`);
  expect(performance.now() - t).toBeLessThan(4500);

  t = performance.now();
  expect((await search('series')).length).toBe(200); // capped; first search builds the index
  expect(performance.now() - t).toBeLessThan(9000);

  t = performance.now();
  expect((await search('result 1999')).map(i => i.q.id)).toContain('q1999');
  expect(performance.now() - t).toBeLessThan(900);
  expect((await listLibrary({ subject: 'math', tag: 't3' })).every(i => i.q.subject === 'math' && i.q.tags.includes('t3'))).toBe(true);
}, 20000);

it('measures list, warm search, backup export and the first page of rows (2000 items)', async () => {
  const ms = async (fn: () => Promise<unknown>) => { const t = performance.now(); await fn(); return Math.round(performance.now() - t); };
  const list = await ms(() => listLibrary({}));
  const warmSearch = await ms(() => search('series'));
  const { exportBackup } = await import('../backup');
  let size = 0;
  const backup = await ms(async () => { size = (await exportBackup()).length; });
  console.log(`PERF (2000 items, fake-indexeddb): list ${list} ms, warm search ${warmSearch} ms, exportBackup ${backup} ms (${Math.round(size / 1024)} KB)`);
  expect(list).toBeLessThan(1500);
  expect(warmSearch).toBeLessThan(300);
  expect(backup).toBeLessThan(3000);
}, 20000);
