import { useEffect, useState } from 'react';
import { Button, Card, Spinner } from '@/components/ui';

/** After this many seconds we say why it is slow: a resting model hands over to the next one. */
const SLOW_AFTER_S = 12;

/** Shown while the AI works: the question being answered, a spinner, a slow-reply hint after 12 s, Cancel. */
export function Thinking({ question, hasPhoto, onCancel }: { question: string; hasPhoto?: boolean; onCancel: () => void }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const shown = question.replace(/\s+/g, ' ').trim();
  return (
    <Card className="elev-2 flex flex-col items-center gap-5 py-10 text-center" aria-live="polite">
      <span className="brand-grad flex h-14 w-14 items-center justify-center rounded-full text-accent-ink shadow-glow">
        <Spinner label="Working on your answer" />
      </span>
      <div className="min-w-0 max-w-full">
        <p className="text-lg font-semibold">Working through it…</p>
        <p className="mt-1 text-base text-muted">
          {secs >= SLOW_AFTER_S ? 'Taking a little longer than usual. If the first model is busy, the next one takes over.' : 'This usually takes a few seconds.'}
        </p>
      </div>
      {(shown || hasPhoto) && (
        <p className="line-clamp-2 w-full break-words rounded-md bg-raised px-4 py-3 text-sm text-ink-2">
          {shown || 'Your photo'}
        </p>
      )}
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    </Card>
  );
}
