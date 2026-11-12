import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Answer, Question } from '@/types';
import { SolverDB, db } from '../db';
import { resetIndex } from '../search';
import { deleteQuestions, getAnswer, getQuestion, listLibrary, listTags, queuePending, listPending, removePending,
  renameTag, restoreDeleted, saveAnswer, saveQuestion, search, putCard, listDueCards } from '../store';
import { exportBackup, importBackup } from '../backup';
import { parseBackup } from '../validate';

const q = (id: string, over: Partial<Question> = {}): Question =>
  ({ id, text: `question ${id}`, subject: 'math', tags: [], starred: false, createdAt: 1000, ...over });
const a = (id: string, questionId: string, over: Partial<Answer> = {}): Answer =>
  ({ id, questionId, mode: 'learn', finalAnswer: 'x = 4', steps: [{ id: 's1', title: 'Isolate', body: 'move terms' }],
     verified: 'unchecked', model: 'm', createdAt: 2000, ...over });

beforeEach(async () => {
  await Promise.all(db.tables.map(t => t.clear()));
  resetIndex();
});

describe('migrations', () => {
  it('upgrades a v1 database without losing data', async () => {
    const old = new Dexie('mig');
    old.version(1).stores({
      questions: 'id, subject, *tags, createdAt', answers: 'id, questionId, createdAt', images: 'id, createdAt',
      cache: 'hash, createdAt', pending: 'id, createdAt', flashcards: 'id, subject, due, sourceAnswerId',
    });
    await old.table('questions').put(q('old'));
    old.close();
    const upgraded = new SolverDB('mig');
    await upgraded.open();
    expect((await upgraded.questions.get('old'))?.text).toBe('question old');
    expect(upgraded.tables.map(t => t.name)).toContain('meta');
    upgraded.close();
  });
});

describe('store', () => {
  it('saves, gets, lists and filters', async () => {
    await saveQuestion(q('1', { tags: ['exam'], createdAt: 1 }));
    await saveQuestion(q('2', { subject: 'physics', starred: true, createdAt: 2 }));
    await saveAnswer(a('a1', '1'));
    expect((await getQuestion('1'))?.id).toBe('1');
    expect((await getAnswer('a1'))?.questionId).toBe('1');
    expect((await listLibrary({})).map(i => i.q.id)).toEqual(['2', '1']);
    expect((await listLibrary({ subject: 'physics' })).length).toBe(1);
    expect((await listLibrary({ tag: 'exam' }))[0].a?.id).toBe('a1');
    expect((await listLibrary({ starred: true }))[0].q.id).toBe('2');
  });

  it('searches question text, answer text and tags, and follows edits and deletes', async () => {
    await saveQuestion(q('1', { text: 'Solve the quadratic equation', tags: ['algebra'] }));
    await saveAnswer(a('a1', '1', { finalAnswer: 'roots are 2 and 3' }));
    expect((await search('quadratic')).length).toBe(1);
    expect((await search('roots')).length).toBe(1);
    expect((await search('algebra')).length).toBe(1);
    await renameTag('algebra', 'maths');
    expect((await search('algebra')).length).toBe(0);
    expect((await search('maths')).length).toBe(1);
    await deleteQuestions(['1']);
    expect((await search('quadratic')).length).toBe(0);
  });

  it('delete returns a snapshot that restores everything', async () => {
    await saveQuestion(q('1'));
    await saveAnswer(a('a1', '1'));
    const snap = await deleteQuestions(['1']);
    expect(await getQuestion('1')).toBeUndefined();
    expect(await getAnswer('a1')).toBeUndefined();
    await restoreDeleted(snap);
    expect((await getAnswer('a1'))?.id).toBe('a1');
    expect((await search('question')).length).toBe(1);
  });

  it('lists and renames tags, removes with empty name', async () => {
    await saveQuestion(q('1', { tags: ['a', 'b'] }));
    await saveQuestion(q('2', { tags: ['a'] }));
    expect((await listTags())[0]).toEqual({ tag: 'a', count: 2 });
    await renameTag('a', '');
    expect((await getQuestion('1'))?.tags).toEqual(['b']);
  });

  it('queues pending items in order and finds due cards', async () => {
    const id1 = 'p1';
    await queuePending({ id: 'p1', text: 'one', subject: 'math', mode: 'learn', createdAt: 1 });
    await queuePending({ id: 'p2', text: 'two', subject: 'math', mode: 'learn', createdAt: 2 });
    expect((await listPending()).length).toBe(2);
    await removePending(id1);
    expect((await listPending()).length).toBe(1);
    const card = { id: 'c', front: 'f', back: 'b', subject: 'math' as const, due: 5, interval: 0, ease: 2.5, reps: 0, lapses: 0 };
    await putCard(card);
    expect((await listDueCards(10)).length).toBe(1);
    expect((await listDueCards(1)).length).toBe(0);
  });
});

describe('backup', () => {
  it('round-trips: backup, wipe, restore', async () => {
    await saveQuestion(q('1', { tags: ['t'] }));
    await saveAnswer(a('a1', '1'));
    await db.images.put({ id: 'img', blob: new Blob([new Uint8Array([1, 2, 3, 250])], { type: 'image/png' }), createdAt: 1 });
    await putCard({ id: 'c', front: 'f', back: 'b', subject: 'math', due: 1, interval: 0, ease: 2.5, reps: 0, lapses: 0 });
    const json = await exportBackup();
    await Promise.all(db.tables.map(t => t.clear()));
    expect(await importBackup(json)).toEqual({ added: 4, skipped: 0 });
    expect((await getAnswer('a1'))?.finalAnswer).toBe('x = 4');
    const img = await db.images.get('img');
    expect(new Uint8Array(await img!.blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3, 250]));
    expect((await search('question')).length).toBe(1);
  });

  it('merges and skips duplicates without overwriting', async () => {
    await saveQuestion(q('1', { text: 'local version' }));
    const json = JSON.stringify({ app: 'solver-nq', version: 1, exportedAt: 1, questions: [q('1', { text: 'backup version' }), q('2')], answers: [], flashcards: [], images: [] });
    expect(await importBackup(json)).toEqual({ added: 1, skipped: 1 });
    expect((await getQuestion('1'))?.text).toBe('local version');
  });
});

describe('import validation', () => {
  it('rejects garbage without throwing', async () => {
    for (const bad of ['', 'not json', '[]', '{}', '{"app":"other"}', '{"app":"solver-nq","version":99}', 'null']) {
      const r = await importBackup(bad);
      expect(r.added).toBe(0);
      expect(r.error).toBeTruthy();
    }
  });

  it('drops malformed records and orphan answers but keeps good ones', async () => {
    const json = JSON.stringify({
      app: 'solver-nq', version: 1, exportedAt: 1,
      questions: [q('good'), { id: 'bad' }, null, q('badsubj', { subject: 'nope' as never })],
      answers: [a('a1', 'good'), a('orphan', 'missing'), { id: 'junk' }],
      flashcards: 'not an array', images: [{ id: 'x' }],
    });
    const p = parseBackup(json);
    expect(p.ok && p.dropped).toBe(5);
    expect(await importBackup(json)).toEqual({ added: 2, skipped: 6 });
  });

  it('is all-or-nothing when a write fails', async () => {
    const dupe = q('same');
    const json = JSON.stringify({ app: 'solver-nq', version: 1, exportedAt: 1, questions: [dupe, dupe], answers: [], flashcards: [], images: [] });
    const r = await importBackup(json);
    expect(r.error).toBeTruthy();
    expect(await getQuestion('same')).toBeUndefined();
  });
});
