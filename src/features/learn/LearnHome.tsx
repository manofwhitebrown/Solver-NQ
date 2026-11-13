import { Link } from 'react-router-dom';
import { Button, Card, Cluster, EmptyState, PageHeader, Section, Select, Skeleton, Stack, SubjectTile } from '@/components/ui';
import { TodayCard } from '@/features/plan';
import { CRAM_DAYS, currentStreak, goalProgress } from '@/lib/srs';
import type { Subject } from '@/types';
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
          <div className="brand-grad rounded-xl p-6 text-accent-ink shadow-glow lg:p-8">
            <div className="flex items-center gap-5">
              <span className="rounded-full bg-surface p-2 text-ink shadow-soft">
                <ProgressRing ratio={goal.ratio} label={`${goal.done}/${goal.goal}`} sub="today" size={104} />
              </span>
              <div className="min-w-0">
                <p className="text-3xl font-extrabold leading-none tracking-tight">{due.length}</p>
                <p className="mt-1 text-base font-semibold">{due.length === 1 ? 'card due today' : 'cards due today'}</p>
                <p className="mt-3 inline-flex rounded-full bg-accent-ink/20 px-3 py-1 text-sm font-semibold">
                  {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link to="/learn/review" aria-disabled={!due.length}><Button block variant="secondary" disabled={!due.length} className="font-bold text-accent">Start review</Button></Link>
              <Link to="/learn/quiz" className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-accent-ink/50 px-5 text-base font-semibold text-accent-ink transition hover:bg-accent-ink/15 active:scale-[.98]">Start quiz</Link>
            </div>
          </div>
          {soon > 0 && <Link to="/learn/review?cram=1"><Button block variant="ghost">Cram: also review {soon} card{soon === 1 ? '' : 's'} due within {CRAM_DAYS} days</Button></Link>}
          <TodayCard />
        </Stack>
      </Section>

      <Section title="Decks">
        {cards.length === 0 ? (
          <EmptyState title="No cards yet" text="Open a saved answer or a note and make flashcards from it, or import a deck."
            action={<Link to="/library" className="inline-flex"><Button variant="secondary">Go to library</Button></Link>} />
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[...decks.entries()].map(([subject, d]) => (
              <li key={subject}>
                <Link to={`/learn/review?subject=${subject}`}>
                  <Card interactive className="flex min-h-[72px] items-center gap-4 py-4 lg:py-4">
                    <SubjectTile subject={subject} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold capitalize text-ink">{subject}</span>
                      <span className="block text-[15px] text-ink-2">{d.total} {d.total === 1 ? 'card' : 'cards'}</span>
                    </span>
                    <span className={d.due ? 'rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-ink' : 'text-sm font-semibold text-muted'}>{d.due ? `${d.due} due` : 'All done'}</span>
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
