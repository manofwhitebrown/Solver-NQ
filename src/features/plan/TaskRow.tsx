import { Link } from 'react-router-dom';
import { cn } from '@/components/ui';
import type { Task } from '@/lib/plan';

/** One task: tick it off on the left, tap the text to open the right screen. */
export function TaskRow({ task, done, onToggle }: { task: Task; done: boolean; onToggle: (id: string) => void }) {
  const rest = task.kind === 'rest';
  return (
    <li className="flex min-h-16 items-center gap-3 py-2">
      {rest ? (
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center text-xl">🌙</span>
      ) : (
        <button type="button" role="checkbox" aria-checked={done} aria-label={`Mark done: ${task.title}`}
          onClick={() => onToggle(task.id)} className="flex h-11 w-11 shrink-0 items-center justify-center">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full border-2 transition',
            done ? 'border-accent bg-accent text-white' : 'border-line-strong bg-raised')}>
            {done && <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="m5 10.5 3.2 3.2L15 6.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
        </button>
      )}
      <div className="min-w-0 flex-1">
        {rest ? <p className="text-base text-ink">{task.title}</p> : (
          <Link to={task.to} className={cn('block text-base font-semibold text-ink', done && 'text-muted line-through')}>{task.title}</Link>
        )}
        {!rest && <p className="text-sm text-muted">{task.minutes} min</p>}
      </div>
      {!rest && <Link to={task.to} aria-label="Open" className="flex h-11 w-11 shrink-0 items-center justify-center text-muted">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
      </Link>}
    </li>
  );
}
