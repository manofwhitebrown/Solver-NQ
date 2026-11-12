import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, deleteNote, getNote, listNotes, saveNote } from '@/lib/db';
import { newNote, titleFrom } from './build';
import { noteFlashcards } from './noteCards';
import { buildNoteQuiz } from './noteQuiz';
import { noteToMarkdown, noteToText } from './exportNote';

const TEXT = 'Entropy is a measure of disorder in a system. Enthalpy is the total heat content of a system.\nATP: the energy currency of the cell\n' +
  'Osmosis is the movement of water across a membrane. Diffusion is the spread of particles from high to low concentration.';

beforeEach(async () => { await Promise.all(db.tables.map((t) => t.clear())); });

describe('note CRUD', () => {
  it('saves, lists newest first, searches, filters and deletes', async () => {
    const a = newNote({ text: TEXT, source: 'paste', subject: 'physics', title: 'Thermo' }, 1000);
    const b = newNote({ text: 'Mitosis is cell division.', source: 'file', subject: 'biology', tags: ['bio'] }, 2000);
    await saveNote(a); await saveNote(b);
    expect((await listNotes()).map((n) => n.id)).toEqual([b.id, a.id]);
    expect((await listNotes({ subject: 'biology' })).map((n) => n.id)).toEqual([b.id]);
    expect((await listNotes({ text: 'enthalpy' })).map((n) => n.id)).toEqual([a.id]);
    expect((await getNote(a.id))?.title).toBe('Thermo');
    await deleteNote(a.id);
    expect(await getNote(a.id)).toBeUndefined();
  });
  it('titleFrom uses the first line', () => { expect(titleFrom('# Cell biology\nbody')).toBe('Cell biology'); expect(titleFrom('  ')).toBe('Untitled note'); });
});

describe('notes to learning', () => {
  const n = newNote({ text: TEXT, source: 'paste', subject: 'physics' });
  it('makes cards and skips ones that already exist', () => {
    const cards = noteFlashcards(n, []);
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.every((c) => c.subject === 'physics' && c.back.length > 5)).toBe(true);
    const again = noteFlashcards(n, [{ front: cards[0].front }]);
    expect(again.length).toBe(cards.length - 1);
  });
  it('builds a quiz with a question record per item', () => {
    const { items, questions } = buildNoteQuiz(n, 3);
    expect(items).toHaveLength(3);
    expect(items.every((i) => questions[i.questionId])).toBe(true);
  });
  it('exports markdown and plain text', () => {
    const md = noteToMarkdown(n), txt = noteToText(n);
    expect(md).toContain('## Summary');
    expect(md).toContain('## Key terms');
    expect(txt).not.toContain('##');
  });
});
