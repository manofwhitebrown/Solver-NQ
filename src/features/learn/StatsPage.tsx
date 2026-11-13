import { Link } from 'react-router-dom';
import { Button, Card, PageHeader, Section, Skeleton, Stack } from '@/components/ui';
import { accuracy, accuracySeries, cardMaturity, currentStreak, lastDays, retentionRate } from '@/lib/srs';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { useLearnData } from './useLearnData';

const dayNum = (k: string) => String(Number(k.slice(8)));
const pct = (n: number) => `${Math.round(n * 100)}%`;
const EMPTY = 'Review some cards to see your progress';

function Stat({ value, label }: { value: string | number; label: string }) {
  return <Card className="px-3 py-4 text-center lg:p-5"><p className="text-2xl font-extrabold text-accent lg:text-3xl">{value}</p><p className="mt-1 text-[13px] font-semibold text-ink-2">{label}</p></Card>;
}

export function StatsPage() {
  const { cards, progress, loading } = useLearnData();
  if (loading) return <Skeleton className="h-48 w-full" />;

  const days = lastDays(progress, 14);
  const acc = accuracySeries(progress, 14);
  const m = cardMaturity(cards);
  const total = days.reduce((s, d) => s + d.reviews, 0);

  return (
    <>
      <PageHeader title="Stats" subtitle="The last 14 days" back="/learn" />
      <Section>
        <div className="grid grid-cols-3 gap-4">
          <Stat value={currentStreak(progress)} label="Day streak" /><Stat value={pct(accuracy(progress))} label="Accuracy" /><Stat value={pct(retentionRate(progress))} label="Retention (30d)" />
        </div>
      </Section>
      <Section>
        <Stack>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Reviews per day</h2>
            {total === 0 ? <p className="py-6 text-center text-base text-ink-2">{EMPTY}</p>
              : <BarChart label="Reviews per day, last 14 days" data={days.map((d) => ({ label: dayNum(d.day), value: d.reviews }))} />}
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Accuracy</h2>
            {total === 0 ? <p className="py-6 text-center text-base text-ink-2">{EMPTY}</p>
              : <LineChart label="Daily accuracy, last 14 days" data={acc.map((d) => ({ label: dayNum(d.day), value: d.value }))} />}
          </Card>
          <Card>
            <h2 className="mb-2 text-lg font-semibold">Your cards</h2>
            <p className="text-base text-ink-2">{m.new} new · {m.young} learning · {m.mature} mature (21+ days)</p>
          </Card>
        </Stack>
      </Section>
      <Link to="/learn" className="block"><Button block variant="secondary">Back to Learn</Button></Link>
    </>
  );
}
