import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Note } from '@/types';
import { SolverDB, db } from '../db';
import { resetIndex } from '../search';
import { deleteNote, getNote, listNotes, saveNote } from '../notes';
import { kvDelete, kvGet, kvSet } from '../kv';
import { exportBackup, importBackup } from '../backup';

const n = (id: string, over: Partial<Note> = {}): Note =>
  ({ id, title: `note ${id}`, source: 'paste', text: 'body', subject: 'math', tags: [], createdAt: 1, updatedAt: 1, ...over });

beforeEach(async () => {
  await Promise.all(db.tables.map(t => t.clear()));
  resetIndex();
});

describe('v3 migration', () => {
  it('upgrades a v2 database and adds notes + kv', async () => {
    const old = new Dexie('mig3');
    old.version(1).stores({
      questions: 'id, subject, *tags, createdAt', answers: 'id, questionId, createdAt', images: 'id, createdAt',
      cache: 'hash, createdAt', pending: 'id, createdAt', flashcards: 'id, subject, due, sourceAnswerId',
    });
    old.version(2).stores({ meta: 'key' });
    await old.table('questions').put({ id: 'old', text: 't', subject: 'math', tags: [], starred: false, createdAt: 1 });
    old.close();
    const up = new SolverDB('mig3');
    await up.open();
    expect((await up.questions.get('old'))?.id).toBe('old');
    expect(up.tables.map(t => t.name)).toEqual(expect.arrayContaining(['notes', 'kv']));
    await up.notes.put(n('x'));
    expect((await up.notes.get('x'))?.title).toBe('note x');
    up.close();
  });
});

describe('notes', () => {
  it('saves, gets, filters, searches and deletes', async () => {
    await saveNote(n('1', { title: 'Photosynthesis', text: 'chlorophyll absorbs light', subject: 'biology', tags: ['exam'], updatedAt: 5 }));
    await saveNote(n('2', { updatedAt: 9 }));
    expect((await getNote('1'))?.title).toBe('Photosynthesis');
    expect((await listNotes()).map(x => x.id)).toEqual(['2', '1']);
    expect((await listNotes({ subject: 'biology' })).length).toBe(1);
    expect((await listNotes({ tag: 'exam' })).length).toBe(1);
    expect((await listNotes({ text: 'chlorophyll' })).map(x => x.id)).toEqual(['1']);
    await saveNote(n('1', { title: 'Photosynthesis', text: 'stomata', subject: 'biology' }));
    expect((await listNotes({ text: 'chlorophyll' })).length).toBe(0);
    await deleteNote('1');
    expect(await getNote('1')).toBeUndefined();
    expect((await listNotes({ text: 'stomata' })).length).toBe(0);
  });
});

describe('kv', () => {
  it('gets, sets, overwrites and deletes', async () => {
    expect(await kvGet('plan')).toBeUndefined();
    await kvSet('plan', { days: 3 });
    expect(await kvGet<{ days: number }>('plan')).toEqual({ days: 3 });
    await kvSet('plan', { days: 4 });
    expect((await kvGet<{ days: number }>('plan'))?.days).toBe(4);
    await kvDelete('plan');
    expect(await kvGet('plan')).toBeUndefined();
  });
});

describe('backup with notes and kv', () => {
  it('round-trips and stays merge-safe', async () => {
    await saveNote(n('1', { text: 'keep me' }));
    await kvSet('plan', { a: 1 });
    const json = await exportBackup();
    expect(JSON.parse(json).version).toBe(2);
    await Promise.all(db.tables.map(t => t.clear()));
    resetIndex();
    const r = await importBackup(json);
    expect(r.error).toBeUndefined();
    expect(r.added).toBe(2);
    expect((await getNote('1'))?.text).toBe('keep me');
    expect(await kvGet('plan')).toEqual({ a: 1 });
    expect((await listNotes({ text: 'keep' })).length).toBe(1);
    await saveNote(n('1', { text: 'edited' }));
    await kvSet('plan', { a: 2 });
    const again = await importBackup(json);
    expect(again.added).toBe(0);
    expect((await getNote('1'))?.text).toBe('edited');
    expect(await kvGet('plan')).toEqual({ a: 2 });
  });
  it('still imports v1 files and drops bad notes', async () => {
    const v1 = JSON.stringify({ app: 'solver-nq', version: 1, exportedAt: 1, questions: [], answers: [], flashcards: [], images: [] });
    expect((await importBackup(v1)).error).toBeUndefined();
    const bad = JSON.stringify({ app: 'solver-nq', version: 2, exportedAt: 1, notes: [n('ok'), { id: 'bad' }], kv: [{ key: 'k', value: 1 }, { nokey: 1 }] });
    const r = await importBackup(bad);
    expect(r).toEqual({ added: 2, skipped: 2 });
  });
});
