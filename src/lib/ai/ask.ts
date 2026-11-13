import type { Answer, Mode, PendingItem, Question, Subject } from '@/types';
import { getAnswer, getCachedAnswer, putCachedAnswer, queuePending, saveAnswer, saveQuestion } from '@/lib/db';
import { assertCanCall } from './config';
import { scheduleFlushAt } from './flushTimer';
import { AiError } from './errors';
import { questionHash } from './hash';
import { newId } from './id';
import { setHistory, buildHistory } from './history';
import { parseAnswer } from './parse';
import { buildSystemPrompt } from './prompts';
import { runModel } from './run';

export interface AskInput { text: string; subject: Subject; mode: Mode; imageDataUrl?: string }

export const IMAGE_ONLY_TEXT = 'Answer the question shown in the image.';

const isOnline = () => typeof navigator === 'undefined' || navigator.onLine;

/** Call the AI, parse, save question + answer, fill the cache. Throws AiError on failure. */
export async function answerNow(
  input: AskInput, signal?: AbortSignal, opts: { offline?: boolean; skipCache?: boolean } = {},
): Promise<{ answerId: string }> {
  const { text, subject, mode, imageDataUrl } = input;
  const hash = questionHash(text, subject, mode);

  // Same question again: instant, works offline. Images are never cached (text alone is not the key).
  if (!imageDataUrl && !opts.skipCache) {
    const cached = await getCachedAnswer(hash);
    if (cached) {
      if (!(await getAnswer(cached.id))) {
        await saveQuestion({ id: cached.questionId, text, subject, tags: [], starred: false, createdAt: Date.now() });
        await saveAnswer(cached);
      }
      return { answerId: cached.id };
    }
  }

  // Offline: the cache was our only chance. Don't wait on a network that isn't there.
  if (opts.offline) { assertCanCall(); throw new AiError('offline'); }

  const { text: raw, model } = await runModel(buildSystemPrompt(subject, mode), [{ role: 'user', content: text }], { imageDataUrl, signal });
  const parsed = parseAnswer(raw);
  // Unparseable text that still looks like cut-off JSON, or nothing at all: don't save it as an answer.
  const looksCut = !parsed.finalAnswer && /^\s*(```(json)?\s*)?[{[]/.test(raw);
  if (!raw.trim() || (!parsed.finalAnswer.trim() && !parsed.steps.length) || looksCut) throw new AiError('server');
  const now = Date.now();
  const q: Question = { id: newId(), text, subject, tags: [], starred: false, createdAt: now };
  const a: Answer = {
    id: newId(), questionId: q.id, mode, finalAnswer: parsed.finalAnswer, summary: parsed.summary,
    steps: parsed.steps.map((s) => ({ id: newId(), ...s })), verified: 'unchecked', model, createdAt: now,
  };
  await saveQuestion(q);
  await saveAnswer(a);
  if (!imageDataUrl) await putCachedAnswer(hash, a);
  setHistory(a.id, [...buildHistory(q, a)]);
  return { answerId: a.id };
}

async function queue(input: AskInput, retryAt?: number): Promise<{ queued: true; retryAt?: number }> {
  const item: PendingItem = { id: newId(), createdAt: Date.now(), ...input };
  await queuePending(item);
  if (retryAt) scheduleFlushAt(retryAt);
  return { queued: true, retryAt };
}

export async function askQuestion(input: AskInput, signal?: AbortSignal, opts: { skipCache?: boolean } = {}): Promise<{ answerId: string } | { queued: true; retryAt?: number }> {
  const text = input.text.trim();
  if (!text && !input.imageDataUrl) throw new AiError('bad_request');
  const clean = { ...input, text: text || IMAGE_ONLY_TEXT };
  if (!isOnline()) {
    // Cached answers still work offline; anything else waits in the queue.
    try { return await answerNow(clean, signal, { offline: true }); } catch (e) {
      if (e instanceof AiError && e.code === 'no_key') throw e;
      return queue(clean);
    }
  }
  try {
    return await answerNow(clean, signal, opts);
  } catch (e) {
    if (e instanceof AiError && e.retryable) return queue(clean, e.retryAt);
    throw e;
  }
}
