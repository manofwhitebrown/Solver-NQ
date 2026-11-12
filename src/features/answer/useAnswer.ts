import { useCallback, useEffect, useState } from 'react';
import type { Answer, Question, Step } from '@/types';
import { getAnswer, getQuestion, listPending, saveAnswer, saveQuestion } from '@/lib/db';
import { verify } from '@/lib/verify';

export type AnswerState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'queued' }
  | { status: 'missing' }
  | { status: 'ready'; q: Question; a: Answer };

/** Loads one answer with its question, re-checks it with verify(), and offers small save helpers. */
export function useAnswer(id: string | undefined) {
  const [state, setState] = useState<AnswerState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let dead = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const a = id ? await getAnswer(id) : undefined;
        if (dead) return;
        if (!a) {
          // Not saved yet: if questions are waiting for a connection, show the queued state and keep looking.
          const waiting = (await listPending()).length > 0;
          if (dead) return;
          setState({ status: waiting ? 'queued' : 'missing' });
          if (waiting) timer = setTimeout(() => void load(), 3000);
          return;
        }
        const q = await getQuestion(a.questionId);
        if (dead) return;
        if (!q) { setState({ status: 'missing' }); return; }
        setState({ status: 'ready', q, a });
        const verdict = await verify(q.text, a);
        if (dead || verdict === a.verified) return;
        const next = { ...a, verified: verdict };
        await saveAnswer(next);
        if (!dead) setState({ status: 'ready', q, a: next });
      } catch (e) {
        if (!dead) setState({ status: 'error', message: e instanceof Error ? e.message : 'Could not load this answer' });
      }
    };
    setState({ status: 'loading' });
    void load();
    return () => { dead = true; if (timer) clearTimeout(timer); };
  }, [id, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const updateQuestion = useCallback(async (patch: Partial<Question>) => {
    if (state.status !== 'ready') return;
    const q = { ...state.q, ...patch };
    await saveQuestion(q);
    setState({ ...state, q });
  }, [state]);

  /** Follow-up steps are kept on the answer with a "fu-" id so Learn mode never hides them. */
  const addFollowUp = useCallback(async (step: Step) => {
    if (state.status !== 'ready') return;
    const a = { ...state.a, steps: [...state.a.steps, { ...step, id: `fu-${step.id}` }] };
    await saveAnswer(a);
    setState({ ...state, a });
  }, [state]);

  return { state, retry, updateQuestion, addFollowUp };
}
