import { Link } from 'react-router-dom';
import { Button, Card, Skeleton } from '@/components/ui';
import { accuracy, accuracySeries, cardMaturity, currentStreak, lastDays, retentionRate } from '@/lib/srs';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { useLearnData } from './useLearnData';

const dayNum = (k: string) => String(Number(k.slice(8)));
const pct = (n: number) => `${Math.round(n * 100)}%`;

export function StatsPage() {
  const { cards, progress, loading } = useLearnData();
  if (loading) return <div className="p-5"><Skeleton className="h-48 w-full" /></div>;

  const days = lastDays(progress, 14);
  const acc = accuracySeries(progress, 14);
  const m = cardMaturity(cards);
  const total = days.reduce((s, d) => s + d.reviews, 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-5 pb-8">
      <h1 className="text-2xl font-semibold">Stats</h1>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="p-3"><p className="text-xl font-semibold">{currentStreak(progress)}</p><p className="text-xs text-muted">Day streak</p></Card>
        <Card className="p-3"><p className="text-xl font-semibold">{pct(accuracy(progress))}</p><p className="text-xs text-muted">Accuracy</p></Card>
        <Card className="p-3"><p className="text-xl font-semibold">{pct(retentionRate(progress))}</p><p className="text-xs text-muted">Retention (30d)</p></Card>
      </div>

      <Card>
        <h2 className="mb-2 text-base font-semibold">Reviews per day</h2>
        {total === 0 ? <p className="text-[15px] text-muted">No reviews in the last 14 days.</p>
          : <BarChart label="Reviews per day, last 14 days" data={days.map((d) => ({ label: dayNum(d.day), value: d.reviews }))} />}
      </Card>
      <Card>
        <h2 className="mb-2 text-base font-semibold">Accuracy</h2>
        <LineChart label="Daily accuracy, last 14 days" data={acc.map((d) => ({ label: dayNum(d.day), value: d.value }))} />
      </Card>
      <Card>
        <h2 className="mb-2 text-base font-semibold">Your cards</h2>
        <p className="text-[15px] text-muted">{m.new} new · {m.young} learning · {m.mature} mature (21+ days)</p>
      </Card>
      <Link to="/learn"><Button block variant="secondary">Back to Learn</Button></Link>
    </div>
  );
}
