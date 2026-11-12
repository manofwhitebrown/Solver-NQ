import type { QuizItem, Step } from '@/types';
import { getAnswer, getQuestion, listLibrary } from '@/lib/db';
import { AiError } from './errors';
import { getHistory, setHistory } from './history';
import { newId } from './id';
import { parseJsonLoose } from './parse';
import { CARDS_PROMPT, FOLLOW_UP_PROMPT, QUIZ_PROMPT, SIMILAR_PROMPT } from './prompts';
import { runModel } from './run';

async function load(answerId: string) {
  const a = await getAnswer(answerId);
  const q = a && (await getQuestion(a.questionId));
  if (!a || !q) throw new AiError('bad_request');
  return { a, q };
}

const solutionText = (q: { text: string }, a: { finalAnswer: string; steps: Step[] }) =>
  `Question: ${q.text}\n\nFinal answer: ${a.finalAnswer}\n\n` + a.steps.map((s) => `${s.title}: ${s.body}`).join('\n');

export async function followUp(answerId: string, text: string): Promise<Step> {
  const { a, q } = await load(answerId);
  const history = [...getHistory(q, a), { role: 'user' as const, content: text }];
  const { text: raw } = await runModel(FOLLOW_UP_PROMPT, history);
  const j = parseJsonLoose(raw) as { title?: unknown; body?: unknown } | null;
  const step: Step = {
    id: newId(),
    title: typeof j?.title === 'string' && j.title ? j.title : 'Follow-up',
    body: typeof j?.body === 'string' && j.body ? j.body : raw.trim(),
  };
  setHistory(answerId, [...history, { role: 'assistant', content: JSON.stringify({ title: step.title, body: step.body }) }]);
  return step;
}

export async function generateCards(answerId: string): Promise<Array<{ front: string; back: string }>> {
  const { a, q } = await load(answerId);
  const { text } = await runModel(CARDS_PROMPT, [{ role: 'user', content: solutionText(q, a) }]);
  const j = parseJsonLoose(text);
  const cards = (Array.isArray(j) ? j : [])
    .map((c: Record<string, unknown> | null) => ({ front: String(c?.front ?? '').trim(), back: String(c?.back ?? '').trim() }))
    .filter((c) => c.front && c.back);
  if (!cards.length) throw new AiError('unknown');
  return cards;
}

export async function generateQuiz(questionIds: string[], count: number): Promise<QuizItem[]> {
  const wanted = new Set(questionIds);
  const entries = (await listLibrary({})).filter((e) => wanted.has(e.q.id) && e.a);
  if (!entries.length) throw new AiError('bad_request');
  const body = entries.map((e, i) => `#${i}\n${solutionText(e.q, e.a!)}`).join('\n\n---\n\n');
  const { text } = await runModel(QUIZ_PROMPT, [{ role: 'user', content: `Make ${count} items.\n\n${body}` }]);
  const j = parseJsonLoose(text);
  const items: QuizItem[] = [];
  for (const r of Array.isArray(j) ? j : []) {
    const options = Array.isArray(r?.options) ? r.options.map(String) : undefined;
    const prompt = String(r?.prompt ?? '').trim(), answer = String(r?.answer ?? '').trim();
    if (!prompt || !answer) continue;
    const src = entries[Number(r?.source)] ?? entries[0];
    items.push({ id: newId(), questionId: src.q.id, prompt, options, answer, explanation: r?.explanation ? String(r.explanation) : undefined });
  }
  if (!items.length) throw new AiError('unknown');
  return items.slice(0, count);
}

export async function similarProblem(answerId: string): Promise<{ text: string }> {
  const { q } = await load(answerId);
  const { text } = await runModel(SIMILAR_PROMPT, [{ role: 'user', content: q.text }]);
  const j = parseJsonLoose(text) as { text?: unknown } | null;
  return { text: typeof j?.text === 'string' && j.text ? j.text : text.trim() };
}
