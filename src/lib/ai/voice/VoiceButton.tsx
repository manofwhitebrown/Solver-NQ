import { Mic, Square } from 'lucide-react';

interface Props { listening: boolean; onToggle: () => void; disabled?: boolean }

/** Round 48 px microphone button. Pressed state is announced; it never submits anything. */
export function VoiceButton({ listening, onToggle, disabled }: Props) {
  const label = listening ? 'Stop listening' : 'Speak your question';
  return (
    <button
      type="button" aria-label={label} title={label} aria-pressed={listening} disabled={disabled} onClick={onToggle}
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition active:scale-95 disabled:opacity-50 ${listening ? 'border-bad bg-bad-soft text-bad' : 'border-line-strong bg-raised text-ink'}`}
    >
      {listening ? <Square size={20} strokeWidth={1.75} aria-hidden /> : <Mic size={22} strokeWidth={1.75} aria-hidden />}
    </button>
  );
}
