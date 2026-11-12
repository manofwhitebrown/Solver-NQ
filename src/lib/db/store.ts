import type { Answer, CardFilter, Flashcard, LibraryEntry, LibraryFilter, PendingItem, Question } from '@/types';
import { db, type ImageRow } from './db';
import { reindex, searchIds, unindex } from './search';

export type LibraryItem = LibraryEntry;

export async function saveQuestion(q: Question): Promise<void> {
  await db.transaction('rw', db.questions, async () => { await db.questions.put(q); });
  await reindex(q.id);
}

export async function saveAnswer(a: Answer): Promise<void> {
  await db.transaction('rw', db.answers, async () => { await db.answers.put(a); });
  await reindex(a.questionId);
}

export const getQuestion = (id: string) => db.questions.get(id);
export const getAnswer = (id: string) => db.answers.get(id);

/** Latest answer per question, in one query. */
async function latestAnswers(ids: string[]): Promise<Map<string, Answer>> {
  const all = await db.answers.where('questionId').anyOf(ids).toArray();
  const out = new Map<string, Answer>();
  for (const a of all) {
    const cur = out.get(a.questionId);
    if (!cur || a.createdAt > cur.createdAt) out.set(a.questionId, a);
  }
  return out;
}

async function attach(qs: Question[]): Promise<LibraryItem[]> {
  const m = await latestAnswers(qs.map(q => q.id));
  return qs.map(q => ({ q, a: m.get(q.id) }));
}

export async function listLibrary(filter: LibraryFilter = {}): Promise<LibraryItem[]> {
  let qs: Question[];
  if (filter.tag) qs = await db.questions.where('tags').equals(filter.tag).toArray();
  else if (filter.subject) qs = await db.questions.where('subject').equals(filter.subject).toArray();
  else qs = await db.questions.toArray();
  if (filter.tag && filter.subject) qs = qs.filter(q => q.subject === filter.subject);
  if (filter.starred) qs = qs.filter(q => q.starred);
  qs.sort((x, y) => y.createdAt - x.createdAt);
  return attach(qs);
}

export async function search(text: string): Promise<LibraryItem[]> {
  const ids = await searchIds(text);
  if (!ids.length) return [];
  const qs = (await db.questions.bulkGet(ids)).filter((q): q is Question => !!q);
  return attach(qs);
}

/** Every tag with how many questions use it. */
export async function listTags(): Promise<Array<{ tag: string; count: number }>> {
  const counts = new Map<string, number>();
  await db.questions.each(q => q.tags.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

/** Rename a tag everywhere, or remove it when `to` is empty. */
export async function renameTag(from: string, to: string): Promise<void> {
  const ids: string[] = [];
  await db.transaction('rw', db.questions, async () => {
    await db.questions.where('tags').equals(from).modify(q => {
      q.tags = [...new Set(q.tags.map(t => (t === from ? to : t)).filter(Boolean))];
      ids.push(q.id);
    });
  });
  for (const id of ids) await reindex(id);
}

export async function updateQuestions(ids: string[], patch: (q: Question) => void): Promise<void> {
  await db.transaction('rw', db.questions, async () => {
    await db.questions.where('id').anyOf(ids).modify(patch);
  });
  for (const id of ids) await reindex(id);
}

export interface DeletedSnapshot { questions: Question[]; answers: Answer[]; images: ImageRow[] }

/** Delete questions with their answers and image. Returns a snapshot so the UI can offer Undo. */
export async function deleteQuestions(ids: string[]): Promise<DeletedSnapshot> {
  const snap: DeletedSnapshot = { questions: [], answers: [], images: [] };
  await db.transaction('rw', [db.questions, db.answers, db.images], async () => {
    snap.questions = (await db.questions.bulkGet(ids)).filter((q): q is Question => !!q);
    snap.answers = await db.answers.where('questionId').anyOf(ids).toArray();
    const imgIds = snap.questions.map(q => q.imageBlobId).filter((x): x is string => !!x);
    snap.images = (await db.images.bulkGet(imgIds)).filter((r): r is ImageRow => !!r);
    await db.answers.bulkDelete(snap.answers.map(a => a.id));
    await db.questions.bulkDelete(ids);
    await db.images.bulkDelete(snap.images.map(i => i.id));
  });
  for (const id of ids) await unindex(id);
  return snap;
}

export async function restoreDeleted(snap: DeletedSnapshot): Promise<void> {
  await db.transaction('rw', [db.questions, db.answers, db.images], async () => {
    await db.questions.bulkPut(snap.questions);
    await db.answers.bulkPut(snap.answers);
    await db.images.bulkPut(snap.images);
  });
  for (const q of snap.questions) await reindex(q.id);
}

// ---- answer cache (offline repeat questions) ----
export async function getCachedAnswer(hash: string): Promise<Answer | undefined> {
  return (await db.cache.get(hash))?.answer;
}
export async function putCachedAnswer(hash: string, a: Answer): Promise<void> {
  await db.cache.put({ hash, answer: a, createdAt: Date.now() });
}

// ---- offline queue ----
export const queuePending = async (item: PendingItem): Promise<void> => { await db.pending.put(item); };
export const listPending = (): Promise<PendingItem[]> => db.pending.orderBy('createdAt').toArray();
export const removePending = (id: string): Promise<void> => db.pending.delete(id);

// ---- flashcards ----
export const putCard = async (c: Flashcard): Promise<void> => { await db.flashcards.put(c); };
export const deleteCard = (id: string) => db.flashcards.delete(id);
export const listDueCards = (now: number) => db.flashcards.where('due').belowOrEqual(now).toArray();
export async function listCards(filter: CardFilter = {}): Promise<Flashcard[]> {
  const all = filter.subject ? await db.flashcards.where('subject').equals(filter.subject).toArray() : await db.flashcards.toArray();
  return filter.sourceAnswerId ? all.filter(c => c.sourceAnswerId === filter.sourceAnswerId) : all;
}
