import { Card, IconButton } from '@/components/ui';
import { daysUntil, shortDate, type Exam } from '@/lib/plan';

const when = (n: number) => (n < 0 ? 'Finished' : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `${n} days`);

export function ExamCard({ exam, today, onRemove }: { exam: Exam; today: string; onRemove: (id: string) => void }) {
  const n = daysUntil(exam, today);
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-accent-soft text-accent">
        <span className="text-xl font-bold leading-none">{n < 0 ? '✓' : n}</span>
        <span className="text-caption">{n < 0 ? '' : n === 1 ? 'day' : 'days'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-ink">{exam.name || exam.subject}</p>
        <p className="text-sm capitalize text-muted">{exam.subject} · {shortDate(exam.date)} · {when(n)}</p>
      </div>
      <IconButton label={`Remove ${exam.name || exam.subject}`} onClick={() => onRemove(exam.id)}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </IconButton>
    </Card>
  );
}
