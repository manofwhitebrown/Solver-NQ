import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/ui';
import { SUBJECTS } from '@/features/settings/options';
import { listLibrary } from '@/lib/db';
import type { LibraryEntry } from '@/types';

const label = (v: string) => SUBJECTS.find(s => s.value === v)?.label ?? v;

export function RecentList() {
  const [items, setItems] = useState<LibraryEntry[]>([]);
  useEffect(() => {
    let alive = true;
    listLibrary({})
      .then(all => { if (alive) setItems(all.filter(e => e.a).sort((x, y) => y.q.createdAt - x.q.createdAt).slice(0, 5)); })
      .catch(() => { /* library not ready: just show nothing */ });
    return () => { alive = false; };
  }, []);
  if (!items.length) return null;
  return (
    <Section title="Recent questions">
      <ul className="elev-1 divide-y divide-line overflow-hidden rounded-lg">
        {items.map(({ q, a }) => (
          <li key={q.id}>
            <Link to={`/answer/${a!.id}`} className="flex min-h-[64px] flex-col justify-center gap-1 px-5 py-4 transition hover:bg-raised">
              <span className="line-clamp-1 text-base font-semibold">{q.text}</span>
              <span className="text-sm text-muted">{label(q.subject)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
