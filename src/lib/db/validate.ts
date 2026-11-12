import type { Answer, Flashcard, Question } from '@/types';

export const BACKUP_VERSION = 1;
export interface BackupImage { id: string; type: string; data: string }
export interface BackupFile {
  app: 'solver-nq'; version: number; exportedAt: number;
  questions: Question[]; answers: Answer[]; flashcards: Flashcard[]; images: BackupImage[];
}

const SUBJECTS = ['math', 'physics', 'chemistry', 'biology', 'coding', 'languages', 'history', 'commerce', 'other'];
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isStr = (x: unknown): x is string => typeof x === 'string' && x.length > 0;
const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);

export const validQuestion = (q: unknown): q is Question => isObj(q) && isStr(q.id) && typeof q.text === 'string'
  && SUBJECTS.includes(q.subject as string) && Array.isArray(q.tags) && q.tags.every(t => typeof t === 'string')
  && typeof q.starred === 'boolean' && isNum(q.createdAt);

export const validAnswer = (a: unknown): a is Answer => isObj(a) && isStr(a.id) && isStr(a.questionId)
  && (a.mode === 'learn' || a.mode === 'answer') && typeof a.finalAnswer === 'string'
  && Array.isArray(a.steps) && a.steps.every(s => isObj(s) && isStr(s.id) && typeof s.title === 'string' && typeof s.body === 'string')
  && ['match', 'mismatch', 'unchecked'].includes(a.verified as string) && typeof a.model === 'string' && isNum(a.createdAt);

export const validCard = (c: unknown): c is Flashcard => isObj(c) && isStr(c.id) && typeof c.front === 'string'
  && typeof c.back === 'string' && SUBJECTS.includes(c.subject as string)
  && [c.due, c.interval, c.ease, c.reps, c.lapses].every(isNum);

export const validImage = (i: unknown): i is BackupImage => isObj(i) && isStr(i.id) && typeof i.type === 'string' && isStr(i.data);

export type ParseResult = { ok: true; file: BackupFile; dropped: number } | { ok: false; error: string };

/** Parse and validate. Bad individual records are dropped (counted); a bad envelope is rejected. Never throws. */
export function parseBackup(json: string): ParseResult {
  let raw: unknown;
  try { raw = JSON.parse(json); } catch { return { ok: false, error: 'This file is not valid JSON.' }; }
  if (!isObj(raw) || raw.app !== 'solver-nq') return { ok: false, error: 'This is not a Solver-NQ backup.' };
  if (!isNum(raw.version) || raw.version > BACKUP_VERSION) return { ok: false, error: 'This backup comes from a newer app version.' };
  const list = (k: string) => (Array.isArray(raw[k]) ? (raw[k] as unknown[]) : []);
  let dropped = 0;
  const keep = <T>(items: unknown[], ok: (x: unknown) => x is T): T[] =>
    items.filter((x): x is T => (ok(x) ? true : (dropped++, false)));
  const file: BackupFile = {
    app: 'solver-nq', version: raw.version, exportedAt: isNum(raw.exportedAt) ? raw.exportedAt : 0,
    questions: keep(list('questions'), validQuestion),
    answers: keep(list('answers'), validAnswer),
    flashcards: keep(list('flashcards'), validCard),
    images: keep(list('images'), validImage),
  };
  return { ok: true, file, dropped };
}
