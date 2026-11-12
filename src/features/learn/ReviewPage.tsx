import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { putCard } from '@/lib/db';
import { answerCurrent, previewIntervals, recordReview, startSession, summary, type Grade, type Session } from '@/lib/srs';
import { CardText } from './CardText';
import { useLearnData } from './useLearnData';
import { useSwipe } from './useSwipe';

const GRADES: Array<{ g: Grade; label: string; key: string; cls: string }> = [
  { g: 0, label: 'Again', key: '1', cls: 'bg-bad text-white' },
  { g: 1, label: 'Hard', key: '2', cls: 'bg-raised text-ink border border-line' },
  { g: 2, label: 'Good', key: '3', cls: 'bg-accent text-accent-ink' },
  { g: 3, label: 'Easy', key: '4', cls: 'bg-surface text-ink border border-line' },
];
const fmt = (days: number) => (days === 0 ? '10m' : days === 1 ? '1d' : `${days}d`);

export function ReviewPage() {
  const { cards, progress, loading, updateProgress } = useLearnData();
  const [session, setSession] = useState<Session | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { if (!loading && !session) setSession(startSession(cards)); }, [loading, cards, session]);

  const current = session?.queue[0];
  const intervals = useMemo(() => (current ? previewIntervals(current) : null), [current]);

  const grade = (g: Grade) => {
    if (!session || !current || !flipped) return;
    const { session: next, updated } = answerCurrent(session, g);
    void putCard(updated);
    updateProgress(recordReview(progress, g));
    setSession(next);
    setFlipped(false);
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

  if (loading || !session) return <div className="p-5"><Skeleton className="h-64 w-full" /></div>;

  if (!current) {
    const s = summary(session);
    return s.reviewed === 0 ? (
      <EmptyState title="Nothing due" text="You are all caught up. Come back later." action={<Link to="/learn"><Button>Back to Learn</Button></Link>} />
    ) : (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-5">
        <h1 className="text-2xl font-semibold">Session complete</h1>
        <Card className="grid grid-cols-2 gap-3 text-center">
          <Stat label="Reviewed" value={s.reviewed} />
          <Stat label="Accuracy" value={`${Math.round(s.accuracy * 100)}%`} />
          <Stat label="Again" value={s.again} />
          <Stat label="Easy" value={s.easy} />
        </Card>
        <Link to="/learn"><Button block>Done</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-5" {...swipe}>
      <p className="text-sm text-muted">{session.queue.length} left</p>
      <div
        onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a')) setFlipped((f) => !f); }}
        className="min-h-[16rem] cursor-pointer rounded-lg border border-line bg-surface p-6 text-left shadow-soft transition active:scale-[.99]"
      >
        <p className="mb-2 text-xs uppercase tracking-wide text-muted">{flipped ? 'Answer' : 'Question'}</p>
        <CardText>{flipped ? current.back : current.front}</CardText>
      </div>

      {flipped ? (
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map(({ g, label, key, cls }) => (
            <button key={g} type="button" onClick={() => grade(g)}
              className={`flex min-h-[56px] flex-col items-center justify-center rounded-md text-sm font-semibold ${cls}`}>
              {label}
              <span className="text-[11px] font-normal opacity-80">{intervals ? fmt(intervals[g]) : ''} · {key}</span>
            </button>
          ))}
        </div>
      ) : (
        <Button block onClick={() => setFlipped(true)}>Show answer (Space)</Button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-2xl font-semibold">{value}</p><p className="text-sm text-muted">{label}</p></div>;
}
