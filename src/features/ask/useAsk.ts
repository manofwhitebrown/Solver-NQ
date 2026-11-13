import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiError, askQuestion, previewAnswer } from '@/lib/ai';
import type { AiErrorCode } from '@/lib/ai/errors';
import type { Mode, Subject } from '@/types';

export type AskStatus = 'idle' | 'busy' | 'queued';

/** Submit/cancel logic for the Ask screen. `errorCode` lets the screen pick the right action button. */
export function useAsk() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AskStatus>('idle');
  const [retryAt, setRetryAt] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState<AiErrorCode | undefined>();
  const [preview, setPreview] = useState<string[]>([]);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => () => ctrl.current?.abort(), []);

  const submit = useCallback(async (input: { text: string; subject: Subject; mode: Mode; imageDataUrl?: string }) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setError('');
    setErrorCode(undefined);
    setPreview([]);
    setStatus('busy');
    try {
      // Streamed replies: show the step titles written so far. Display only; the saved answer is parsed from the finished reply.
      const onPartial = (t: string) => {
        if (c.signal.aborted) return;
        const titles = (previewAnswer(t)?.steps ?? []).map(x => x.title.trim()).filter(Boolean);
        setPreview(prev => (titles.length === prev.length ? prev : titles));
      };
      const r = await askQuestion(input, c.signal, { onPartial });
      if ('queued' in r) { setPreview([]); setRetryAt(r.retryAt); setStatus('queued'); return true; }
      navigate(`/answer/${r.answerId}`);
      return true;
    } catch (e) {
      setStatus('idle');
      setPreview([]);
      if (!(e instanceof AiError && e.code === 'cancelled')) {
        setError(e instanceof AiError ? e.message : 'Something went wrong. Please try again.');
        setErrorCode(e instanceof AiError ? e.code : 'unknown');
      }
      return false;
    }
  }, [navigate]);

  const cancel = useCallback(() => ctrl.current?.abort(), []);
  const reset = useCallback(() => { setStatus('idle'); setError(''); setErrorCode(undefined); }, []);
  const clearError = useCallback(() => { setError(''); setErrorCode(undefined); }, []);
  return { status, error, errorCode, preview, submit, cancel, reset, clearError, retryAt };
}
