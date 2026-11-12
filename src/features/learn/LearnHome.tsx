import { Link } from 'react-router-dom';
import { Button, Card, Cluster, EmptyState, PageHeader, Section, Select, Skeleton, Stack } from '@/components/ui';
import { TodayCard } from '@/features/plan';
import { CRAM_DAYS, currentStreak, goalProgress } from '@/lib/srs';
import type { Subject } from '@/types';
import { DECK_EMOJI } from './deckStyle';
import { ProgressRing } from './ProgressRing';
import { ReminderToggle } from './ReminderToggle';
import { useLearnData } from './useLearnData';

export function LearnHome() {
  const { cards, progress, loading, updateProgress } = useLearnData();
  if (loading) return <Skeleton className="h-40 w-full" />;

  const now = Date.now();
  const due = cards.filter((c) => c.due <= now);
  const soon = cards.filter((c) => c.due > now && c.due <= now + CRAM_DAYS * 86_400_000).length;
  const goal = goalProgress(progress, now);
  const streak = currentStreak(progress, now);
  const decks = new Map<Subject, { total: number; due: number }>();
  for (const c of cards) {
    const d = decks.get(c.subject) ?? { total: 0, due: 0 };
    d.total++; if (c.due <= now) d.due++;
    decks.set(c.subject, d);
  }

  return (
    <>
      <PageHeader title="Learn" subtitle="Short daily reviews make it stick" />

      <Section>
        <Stack>
          <Card className="flex items-center gap-6">
            <ProgressRing ratio={goal.ratio} label={`${goal.done}/${goal.goal}`} sub="today" size={128} />
            <Stack gap={2}>
              <p className="text-xl font-semibold text-ink">{due.length} due today</p>
              <p className="text-base text-ink-2">{streak > 0 ? `${streak}-day streak` : 'Start a streak today'}</p>
            </Stack>
          </Card>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link to="/learn/review" aria-disabled={!due.length}><Button block disabled={!due.length}>Start review</Button></Link>
            <Link to="/learn/quiz"><Button block variant="secondary">Start quiz</Button></Link>
          </div>
          {soon > 0 && <Link to="/learn/review?cram=1"><Button block variant="ghost">Cram: also review {soon} card{soon === 1 ? '' : 's'} due within {CRAM_DAYS} days</Button></Link>}
          <TodayCard />
        </Stack>
      </Section>

      <Section title="Decks">
        {cards.length === 0 ? (
          <EmptyState title="No cards yet" text="Open a saved answer or a note and make flashcards from it, or import a deck."
            action={<Link to="/library"><Button variant="secondary">Go to library</Button></Link>} />
        ) : (
          <ul className="flex flex-col gap-4">
            {[...decks.entries()].map(([subject, d]) => (
              <li key={subject}>
                <Link to={`/learn/review?subject=${subject}`} aria-label={`Review ${subject} deck`}>
                  <Card interactive className="flex min-h-[64px] items-center justify-between gap-4 py-4 lg:py-4">
                    <span className="text-lg font-semibold capitalize text-ink"><span aria-hidden className="mr-3">{DECK_EMOJI[subject]}</span>{subject}</span>
                    <span className="text-[15px] text-ink-2">{d.due} due · {d.total} {d.total === 1 ? "card" : "cards"}</span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="More">
        <Stack>
          <Cluster gap={3}>
            <Link to="/learn/stats"><Button variant="secondary">View stats</Button></Link>
            <Link to="/learn/cards"><Button variant="secondary">Manage cards</Button></Link>
            <Link to="/notes"><Button variant="secondary">Notes</Button></Link>
          </Cluster>
          <Card className="flex items-center justify-between gap-4">
            <label htmlFor="goal" className="text-base font-semibold text-ink">Daily goal (reviews)</label>
            <Select id="goal" className="w-28" value={String(progress.goal)}
              onChange={(e) => updateProgress({ ...progress, goal: Number(e.target.value) })}
              options={[...new Set([10, 20, 30, 50, 100, progress.goal])].sort((a, b) => a - b).map((n) => ({ value: String(n), label: String(n) }))} />
          </Card>
          <ReminderToggle />
        </Stack>
      </Section>
    </>
  );
}
