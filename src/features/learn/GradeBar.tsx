import type { Grade } from '@/lib/srs';

const GRADES: Array<{ g: Grade; label: string; key: string; cls: string }> = [
  { g: 0, label: 'Again', key: '1', cls: 'bg-bad text-bg' },
  { g: 1, label: 'Hard', key: '2', cls: 'bg-raised text-ink border border-line-strong' },
  { g: 2, label: 'Good', key: '3', cls: 'bg-accent text-accent-ink' },
  { g: 3, label: 'Easy', key: '4', cls: 'bg-surface text-ink border border-line-strong' },
];
const fmt = (days: number) => (days === 0 ? '10 min' : days === 1 ? '1 day' : `${days} days`);

export function GradeBar({ intervals, onGrade, showKeys }: { intervals: number[] | null; onGrade: (g: Grade) => void; showKeys: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="How well did you know it?">
      {GRADES.map(({ g, label, key, cls }) => (
        <button key={g} type="button" onClick={() => onGrade(g)}
          className={`flex min-h-[64px] flex-col items-center justify-center rounded-md px-2 text-base font-semibold transition active:scale-[.98] ${cls}`}>
          {label}
          <span className="text-caption font-normal opacity-90">{intervals ? fmt(intervals[g]) : ''}{showKeys ? ` · ${key}` : ''}</span>
        </button>
      ))}
    </div>
  );
}
