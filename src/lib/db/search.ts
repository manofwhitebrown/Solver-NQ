import MiniSearch from 'minisearch';
import type { Answer, Note, Question } from '@/types';
import { db } from './db';

interface Doc { id: string; text: string; answer: string; tags: string; subject: string }

const make = () => new MiniSearch<Doc>({
  fields: ['text', 'answer', 'tags'],
  storeFields: ['id'],
  searchOptions: { prefix: true, fuzzy: 0.15, combineWith: 'AND', boost: { text: 2, tags: 1.5 } },
});

let index: MiniSearch<Doc> | null = null;
let building: Promise<MiniSearch<Doc>> | null = null;

const answerText = (answers: Answer[]) =>
  answers.map(a => [a.finalAnswer, a.summary ?? '', ...a.steps.map(s => `${s.title} ${s.body}`)].join(' ')).join(' ');

export const toDoc = (q: Question, answers: Answer[]): Doc =>
  ({ id: q.id, text: q.text, answer: answerText(answers), tags: q.tags.join(' '), subject: q.subject });

const NOTE = 'note:';
export const toNoteDoc = (n: Note): Doc =>
  ({ id: NOTE + n.id, text: `${n.title} ${n.text.slice(0, 5000)}`, answer: [n.summary ?? '', n.cheatsheet ?? '', ...(n.keyTerms ?? [])].join(' '), tags: n.tags.join(' '), subject: n.subject });

/** Build from the database once; later calls reuse it. */
export function ensureIndex(): Promise<MiniSearch<Doc>> {
  if (index) return Promise.resolve(index);
  building ??= (async () => {
    const m = make();
    const [qs, as] = await Promise.all([db.questions.toArray(), db.answers.toArray()]);
    const byQ = new Map<string, Answer[]>();
    for (const a of as) byQ.set(a.questionId, [...(byQ.get(a.questionId) ?? []), a]);
    m.addAll(qs.map(q => toDoc(q, byQ.get(q.id) ?? [])));
    m.addAll((await db.notes.toArray()).map(toNoteDoc));
    index = m;
    return m;
  })().finally(() => { building = null; });
  return building;
}

/** Re-index one question from what is in the database now. */
export async function reindex(questionId: string): Promise<void> {
  const m = await ensureIndex();
  if (m.has(questionId)) m.discard(questionId);
  const q = await db.questions.get(questionId);
  if (!q) return;
  m.add(toDoc(q, await db.answers.where('questionId').equals(questionId).toArray()));
}

export async function unindex(questionId: string): Promise<void> {
  const m = await ensureIndex();
  if (m.has(questionId)) m.discard(questionId);
}

export async function reindexNote(n: Note): Promise<void> {
  const m = await ensureIndex();
  if (m.has(NOTE + n.id)) m.discard(NOTE + n.id);
  m.add(toNoteDoc(n));
}

export async function unindexNote(id: string): Promise<void> {
  const m = await ensureIndex();
  if (m.has(NOTE + id)) m.discard(NOTE + id);
}

const MAX_RESULTS = 200; // best matches only; keeps the list fast when a word is everywhere

export async function searchIds(text: string): Promise<string[]> {
  const t = text.trim();
  if (!t) return [];
  return (await ensureIndex()).search(t).map(r => r.id as string).filter(id => !id.startsWith(NOTE)).slice(0, MAX_RESULTS);
}

export async function searchNoteIds(text: string): Promise<string[]> {
  const t = text.trim();
  if (!t) return [];
  return (await ensureIndex()).search(t).map(r => r.id as string).filter(id => id.startsWith(NOTE))
    .slice(0, MAX_RESULTS).map(id => id.slice(NOTE.length));
}

/** Drop the in-memory index (used after restore / tests); next search rebuilds it. */
export function resetIndex(): void { index = null; building = null; }
