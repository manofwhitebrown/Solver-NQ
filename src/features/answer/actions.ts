import { useSyncExternalStore } from 'react';
import type { Answer, Question } from '@/types';
import { toast } from '@/components/ui';
import { tts } from '@/lib/tts';
import { answerToSpeech } from './answerText';

export interface AnswerActions {
  q: Question; a: Answer; graphFn: string | null;
  onStar: () => void; onTags: () => void; onCards: () => void; onExport: () => void; onShare: () => void; onCopy: () => void;
}

const SPEEDS = [1, 1.25, 1.5, 0.75];

/** Read-aloud state shared by the laptop toolbar and the phone More sheet. */
export function useReadAloud(a: Answer) {
  const status = useSyncExternalStore(tts.subscribe, tts.getStatus);
  const toggle = () => {
    if (!tts.isSupported()) { toast('Read aloud is not available on this device', 'error'); return; }
    if (status === 'idle') tts.speak(answerToSpeech(a));
    else if (status === 'speaking') tts.pause();
    else tts.resume();
  };
  const cycleSpeed = () => tts.setRate(SPEEDS[(SPEEDS.indexOf(tts.getRate()) + 1) % SPEEDS.length]);
  const label = status === 'speaking' ? 'Pause reading' : status === 'paused' ? 'Resume reading' : 'Read aloud';
  return { status, toggle, cycleSpeed, label, stop: () => tts.stop(), rate: tts.getRate() };
}
