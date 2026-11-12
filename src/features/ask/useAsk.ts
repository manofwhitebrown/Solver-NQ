import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiError, askQuestion } from '@/lib/ai';
import type { Mode, Subject } from '@/types';

export type AskStatus = 'idle' | 'busy' | 'queued';

/** Submit/cancel logic for the Ask screen. */
export function useAsk() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AskStatus>('idle');
  const [error, setError] = useState('');
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => () => ctrl.current?.abort(), []);

  const submit = useCallback(async (input: { text: string; subject: Subject; mode: Mode; imageDataUrl?: string }) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setError('');
    setStatus('busy');
    try {
      const r = await askQuestion(input, c.signal);
      if ('queued' in r) { setStatus('queued'); return true; }
      navigate(`/answer/${r.answerId}`);
      return true;
    } catch (e) {
      setStatus('idle');
      if (!(e instanceof AiError && e.code === 'cancelled')) {
        setError(e instanceof AiError ? e.message : 'Something went wrong. Please try again.');
      }
      return false;
    }
  }, [navigate]);

  const cancel = useCallback(() => ctrl.current?.abort(), []);
  const reset = useCallback(() => { setStatus('idle'); setError(''); }, []);
  return { status, error, submit, cancel, reset };
}
