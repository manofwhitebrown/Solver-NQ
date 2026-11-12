import Dexie, { type Table } from 'dexie';
import type { Answer, Flashcard, PendingItem, Question } from '@/types';

export interface ImageRow { id: string; blob: Blob; thumb?: Blob; createdAt: number }
export interface CacheRow { hash: string; answer: Answer; createdAt: number }
export interface MetaRow { key: string; value: unknown }

export class SolverDB extends Dexie {
  questions!: Table<Question, string>;
  answers!: Table<Answer, string>;
  images!: Table<ImageRow, string>;
  cache!: Table<CacheRow, string>;
  pending!: Table<PendingItem, string>;
  flashcards!: Table<Flashcard, string>;
  meta!: Table<MetaRow, string>;

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
  }
}

export const db = new SolverDB();
