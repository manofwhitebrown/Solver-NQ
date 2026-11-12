import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import { daysUntil, progressOf } from '@/lib/plan';
import { usePlan } from './usePlan';

/** Small card for /learn: today's progress and the next exam. */
export function TodayCard() {
  const { state, plan, today, loading } = usePlan();
  if (loading || !state) return null;
  const next = state.exams.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const prog = progressOf(plan.find((d) => d.day === today)?.tasks ?? [], state.done);
  return (
    <Link to="/plan" className="block">
      <Card interactive>
        <p className="text-sm font-semibold text-muted">Study plan</p>
        {next ? (
          <>
            <p className="mt-1 text-lg font-semibold text-ink">
              {prog.total ? `${prog.done} of ${prog.total} tasks done today` : 'Nothing planned today'}
            </p>
            <p className="text-sm text-muted">{next.name}: {daysUntil(next, today) === 0 ? 'today' : `in ${daysUntil(next, today)} days`}</p>
          </>
        ) : <p className="mt-1 text-base text-ink">Add an exam and get a gentle daily plan.</p>}
      </Card>
    </Link>
  );
}
