import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { currentStreak, goalProgress } from '@/lib/srs';
import type { Subject } from '@/types';
import { ProgressRing } from './ProgressRing';
import { useLearnData } from './useLearnData';

export function LearnHome() {
  const { cards, progress, loading } = useLearnData();
  if (loading) return <div className="p-5"><Skeleton className="h-40 w-full" /></div>;

  const now = Date.now();
  const due = cards.filter((c) => c.due <= now);
  const goal = goalProgress(progress, now);
  const streak = currentStreak(progress, now);
  const decks = new Map<Subject, { total: number; due: number }>();
  for (const c of cards) {
    const d = decks.get(c.subject) ?? { total: 0, due: 0 };
    d.total++; if (c.due <= now) d.due++;
    decks.set(c.subject, d);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5 pb-8">
      <h1 className="text-2xl font-semibold">Learn</h1>

      <Card className="flex items-center gap-5">
        <ProgressRing ratio={goal.ratio} label={`${goal.done}/${goal.goal}`} sub="today" />
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold">{due.length} due today</p>
          <p className="text-[15px] text-muted">{streak > 0 ? `${streak}-day streak` : 'Start a streak today'}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/learn/review" aria-disabled={!due.length}>
          <Button block disabled={!due.length}>Start review</Button>
        </Link>
        <Link to="/learn/quiz"><Button block variant="secondary">Start quiz</Button></Link>
      </div>

      <div className="flex gap-5 text-[15px] font-medium text-accent">
        <Link to="/learn/stats" className="underline-offset-2 hover:underline">View stats</Link>
        <Link to="/learn/cards" className="underline-offset-2 hover:underline">Manage cards</Link>
      </div>

      <h2 className="pt-2 text-base font-semibold">Decks</h2>
      {cards.length === 0 ? (
        <EmptyState
          title="No cards yet"
          text="Open a saved answer and make flashcards from it, or import a deck."
          action={<Link to="/library"><Button variant="secondary">Go to library</Button></Link>}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {[...decks.entries()].map(([subject, d]) => (
            <li key={subject}>
              <Card className="flex min-h-[44px] items-center justify-between py-3">
                <span className="font-medium capitalize">{subject}</span>
                <span className="text-sm text-muted">{d.due} due · {d.total} cards</span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
