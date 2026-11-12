import { useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import type { Answer, Question } from '@/types';
import { Chip, IconButton, toast } from '@/components/ui';
import { tts } from '@/lib/tts';
import { Icon } from './icons';
import { answerToSpeech } from './answerText';

const SPEEDS = [1, 1.25, 1.5, 0.75];

interface Props {
  q: Question; a: Answer; graphFn: string | null;
  onStar: () => void; onTags: () => void; onCards: () => void; onExport: () => void; onShare: () => void; onCopy: () => void;
}

export function Toolbar({ q, a, graphFn, onStar, onTags, onCards, onExport, onShare, onCopy }: Props) {
  const status = useSyncExternalStore(tts.subscribe, tts.getStatus);
  const speak = () => {
    if (!tts.isSupported()) { toast('Read aloud is not available on this device', 'error'); return; }
    if (status === 'idle') tts.speak(answerToSpeech(a));
    else if (status === 'speaking') tts.pause();
    else tts.resume();
  };
  const cycleSpeed = () => tts.setRate(SPEEDS[(SPEEDS.indexOf(tts.getRate()) + 1) % SPEEDS.length]);

  return (
    <div className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 pb-1" role="toolbar" aria-label="Answer actions">
      <IconButton label={q.starred ? 'Remove star' : 'Save to starred'} aria-pressed={q.starred} onClick={onStar}
        className={q.starred ? 'text-warn' : ''}><Icon name="star" filled={q.starred} /></IconButton>
      <IconButton label="Tags" onClick={onTags}><Icon name="tag" /></IconButton>
      <IconButton label="Make flashcards" onClick={onCards}><Icon name="cards" /></IconButton>
      <IconButton label="Export" onClick={onExport}><Icon name="export" /></IconButton>
      <IconButton label={status === 'speaking' ? 'Pause reading' : status === 'paused' ? 'Resume reading' : 'Read aloud'} onClick={speak}
        className={status !== 'idle' ? 'text-accent' : ''}><Icon name="speaker" /></IconButton>
      {status !== 'idle' && (
        <>
          <IconButton label="Stop reading" onClick={() => tts.stop()}><Icon name="stop" /></IconButton>
          <Chip onClick={cycleSpeed} aria-label="Change reading speed">{tts.getRate()}x</Chip>
        </>
      )}
      <IconButton label="Share" onClick={onShare}><Icon name="share" /></IconButton>
      <IconButton label="Copy" onClick={() => { onCopy(); }}><Icon name="copy" /></IconButton>
      {graphFn && (
        <Link to={`/graph?f=${encodeURIComponent(graphFn)}`} aria-label="Graph this" title="Graph this"
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-accent hover:bg-raised">
          <Icon name="graph" />Graph this
        </Link>
      )}
    </div>
  );
}

