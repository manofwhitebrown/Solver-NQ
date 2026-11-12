import Dexie, { type Table } from 'dexie';
import type { Answer, Flashcard, Note, PendingItem, Question } from '@/types';

export interface ImageRow { id: string; blob: Blob; thumb?: Blob; createdAt: number }
export interface CacheRow { hash: string; answer: Answer; createdAt: number }
export interface KvRow { key: string; value: unknown }
export interface MetaRow { key: string; value: unknown }

export class SolverDB extends Dexie {
  questions!: Table<Question, string>;
  answers!: Table<Answer, string>;
  images!: Table<ImageRow, string>;
  cache!: Table<CacheRow, string>;
  pending!: Table<PendingItem, string>;
  flashcards!: Table<Flashcard, string>;
  meta!: Table<MetaRow, string>;
  notes!: Table<Note, string>;
  kv!: Table<KvRow, string>;

  constructor(name = 'solver-nq') {
    super(name);
    // Booleans are not valid IndexedDB keys, so `starred` is filtered in code, not indexed.
    this.version(1).stores({
      questions: 'id, subject, *tags, createdAt',
      answers: 'id, questionId, createdAt',
      images: 'id, createdAt',
      cache: 'hash, createdAt',
      pending: 'id, createdAt',
      flashcards: 'id, subject, due, sourceAnswerId',
    });
    // v2: small key/value table (search-index flag, persist flag)
    this.version(2).stores({ meta: 'key' });
    // v3: study notes and a small key/value table for settings-like data (study planner)
    this.version(3).stores({ notes: 'id, subject, *tags, updatedAt', kv: 'key' });
  }
}

export const db = new SolverDB();
