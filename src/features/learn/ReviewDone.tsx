import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader, Section, Stack } from '@/components/ui';
import type { summary } from '@/lib/srs';

type Sum = ReturnType<typeof summary>;
function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-3xl font-bold text-ink">{value}</p><p className="mt-1 text-base text-ink-2">{label}</p></div>;
}

export function ReviewDone({ s }: { s: Sum }) {
  if (s.reviewed === 0) {
    return <EmptyState title="Nothing due" text="You are all caught up. Come back later." action={<Link to="/learn"><Button>Back to Learn</Button></Link>} />;
  }
  return (
    <>
      <PageHeader title="Session complete" subtitle="Nice work. Short, regular sessions beat long ones." />
      <Section>
        <Stack gap={5}>
          <Card className="grid grid-cols-2 gap-6 text-center">
            <Stat label="Reviewed" value={s.reviewed} /><Stat label="Accuracy" value={`${Math.round(s.accuracy * 100)}%`} />
            <Stat label="Again" value={s.again} /><Stat label="Easy" value={s.easy} />
          </Card>
          <Link to="/learn"><Button block>Done</Button></Link>
        </Stack>
      </Section>
    </>
  );
}
