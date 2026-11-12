import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listLibrary } from '@/lib/db';
import type { LibraryEntry } from '@/types';
import { SUBJECTS } from '@/features/settings/options';

const label = (v: string) => SUBJECTS.find((s) => s.value === v)?.label ?? v;

export function RecentList() {
  const [items, setItems] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    let alive = true;
    listLibrary({})
      .then((all) => { if (alive) setItems(all.filter((e) => e.a).sort((x, y) => y.q.createdAt - x.q.createdAt).slice(0, 5)); })
      .catch(() => { /* library not ready: just show nothing */ });
    return () => { alive = false; };
  }, []);

  if (!items.length) return null;
  return (
    <section aria-labelledby="recent-h" className="mt-10">
      <h2 id="recent-h" className="mb-2 text-sm font-semibold text-muted">Recent questions</h2>
      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {items.map(({ q, a }) => (
          <li key={q.id}>
            <Link to={`/answer/${a!.id}`} className="flex min-h-[56px] flex-col justify-center px-4 py-2 transition hover:bg-raised">
              <span className="line-clamp-1 text-[15px] font-medium">{q.text}</span>
              <span className="text-xs text-muted">{label(q.subject)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
