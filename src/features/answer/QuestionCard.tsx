import { useLayoutEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { Markdown } from './Markdown';

const COLLAPSED_PX = 108; // 4 lines at 18/1.5

/** The question at 18/1.5. Long questions collapse to 4 lines with Show more. */
export function QuestionCard({ subject, text }: { subject: string; text: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [long, setLong] = useState(false);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    if (box.current) setLong(box.current.scrollHeight > COLLAPSED_PX + 4);
  }, [text]);
  const clipped = long && !open;
  return (
    <Card>
      <p className="mb-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold capitalize text-accent">{subject}</p>
      <div ref={box} className="relative overflow-hidden" style={clipped ? { maxHeight: COLLAPSED_PX } : undefined}>
        <Markdown size="question">{text}</Markdown>
        {clipped && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface to-transparent" />}
      </div>
      {long && (
        <Button variant="ghost" size="sm" className="mt-2 -ml-4 min-h-[44px]" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Show less' : 'Show more'}
        </Button>
      )}
    </Card>
  );
}
