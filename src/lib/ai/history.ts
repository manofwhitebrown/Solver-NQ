import type { Answer, Question } from '@/types';
import type { ChatMessage } from './types';

/** Conversation per answer, kept in memory. Rebuilt from the saved answer after a reload. */
const histories = new Map<string, ChatMessage[]>();

export function buildHistory(q: Question, a: Answer): ChatMessage[] {
  const reply = JSON.stringify({
    finalAnswer: a.finalAnswer, steps: a.steps.map(({ title, body }) => ({ title, body })), summary: a.summary,
  });
  return [{ role: 'user', content: q.text }, { role: 'assistant', content: reply }];
}

export function getHistory(q: Question, a: Answer): ChatMessage[] {
  let h = histories.get(a.id);
  if (!h) { h = buildHistory(q, a); histories.set(a.id, h); }
  return h;
}

export function setHistory(answerId: string, h: ChatMessage[]): void { histories.set(answerId, h); }
