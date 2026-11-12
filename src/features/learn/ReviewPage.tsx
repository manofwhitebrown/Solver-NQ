import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconButton, Skeleton, Button } from '@/components/ui';
import { putCard } from '@/lib/db';
import { answerCurrent, previewIntervals, recordReview, startSession, summary, type Grade, type Session } from '@/lib/srs';
import { CardText } from './CardText';
import { GradeBar } from './GradeBar';
import { ReviewDone } from './ReviewDone';
import { useCoarsePointer } from './useCoarse';
import { useLearnData } from './useLearnData';
import { useSwipe } from './useSwipe';

export function ReviewPage() {
  const deck = useSearchParams()[0].get('subject');
  const { cards: allCards, progress, loading, updateProgress } = useLearnData();
  const cards = useMemo(() => (deck ? allCards.filter((c) => c.subject === deck) : allCards), [allCards, deck]);
  const [session, setSession] = useState<Session | null>(null);
  const [total, setTotal] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const touch = useCoarsePointer();
  const nav = useNavigate();

  useEffect(() => {
    if (loading || session) return;
    const s = startSession(cards); setSession(s); setTotal(s.queue.length);
  }, [loading, cards, session]);

  const current = session?.queue[0];
  const intervals = useMemo(() => (current ? previewIntervals(current) : null), [current]);

  const grade = (g: Grade) => {
    if (!session || !current || !flipped) return;
    const { session: next, updated } = answerCurrent(session, g);
    void putCard(updated);
    updateProgress(recordReview(progress, g));
    setSession(next); setFlipped(false);
    setTotal((t) => Math.max(t, next.queue.length));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /input|textarea/i.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); setFlipped((f) => !f); }
      const i = ['1', '2', '3', '4'].indexOf(e.key);
      if (i >= 0) grade(i as Grade);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Swipe: tap-free grading on phones. Left = Again, right = Good, up = Easy, down = Hard.
  const swipe = useSwipe((dir) => {
    if (!flipped) { setFlipped(true); return; }
    grade(dir === 'left' ? 0 : dir === 'right' ? 2 : dir === 'up' ? 3 : 1);
  });

  if (loading || !session) return <Skeleton className="h-64 w-full" />;
  if (!current) return <ReviewDone s={summary(session)} />;

  const left = session.queue.length;
  const done = Math.max(0, total - left);
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-6" {...swipe}>
      <div className="flex items-center gap-4">
        <IconButton label="Close review" className="-ml-2" onClick={() => nav('/learn')}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </IconButton>
        <div className="flex-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Review progress">
          <div className="h-2 overflow-hidden rounded-full bg-raised"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        </div>
        <p className="min-w-[4.5rem] text-right text-sm font-semibold text-ink-2">{left} left</p>
      </div>

      <div className="flex flex-1 items-center">
        <div onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a')) setFlipped((f) => !f); }}
          className="elev-1 w-full cursor-pointer rounded-lg p-6 transition active:scale-[.995] lg:p-8">
          <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-muted">{flipped ? 'Answer' : 'Question'}</p>
          <div className="text-[17px] leading-[1.7]"><CardText>{flipped ? current.back : current.front}</CardText></div>
        </div>
      </div>

      {flipped ? <GradeBar intervals={intervals} onGrade={grade} showKeys={!touch} />
        : <Button block onClick={() => setFlipped(true)}>{touch ? 'Show answer' : 'Show answer (Space)'}</Button>}
    </div>
  );
}
