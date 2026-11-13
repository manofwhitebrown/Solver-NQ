import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceError, joinSpoken, startVoice, voiceSupported, type VoiceSession } from './speech';

/**
 * Microphone input for a text box. The words are added to what is already typed, as they are heard.
 * It never sends anything: the person reads the box and presses Send.
 */
export function useVoiceInput(getText: () => string, setText: (t: string) => void, lang?: string) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const session = useRef<VoiceSession | null>(null);
  const alive = useRef(true);
  const supported = voiceSupported();

  useEffect(() => { alive.current = true; return () => { alive.current = false; session.current?.stop(); }; }, []);

  const stop = useCallback(() => { session.current?.stop(); }, []);

  const start = useCallback(async () => {
    if (session.current) return;
    setError('');
    const base = getText();
    setListening(true);
    try {
      const s = await startVoice({
        onText: t => { if (alive.current) setText(joinSpoken(base, t)); },
        onEnd: () => { session.current = null; if (alive.current) setListening(false); },
        onError: e => { if (alive.current) setError(e.message); },
      }, lang);
      if (!alive.current) s.stop(); else session.current = s;
    } catch (e) {
      session.current = null;
      if (alive.current) { setListening(false); setError(e instanceof VoiceError ? e.message : new VoiceError('failed').message); }
    }
  }, [getText, setText, lang]);

  const toggle = useCallback(() => { if (session.current) stop(); else void start(); }, [start, stop]);
  return { supported, listening, error, toggle, stop };
}
