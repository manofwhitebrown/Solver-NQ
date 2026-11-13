import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Section, SubjectTile } from '@/components/ui';
import { mathToPlain } from '@/features/answer/plainText';
import { SUBJECTS } from '@/features/settings/options';
import { listLibrary } from '@/lib/db';
import type { LibraryEntry } from '@/types';

const label = (v: string) => SUBJECTS.find(s => s.value === v)?.label ?? v;

export function RecentList() {
  const [items, setItems] = useState<LibraryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    listLibrary({})
      .then(all => { if (alive) { setItems(all.filter(e => e.a).sort((x, y) => y.q.createdAt - x.q.createdAt).slice(0, 5)); setLoaded(true); } })
      .catch(() => { /* library not ready: just show nothing */ });
    return () => { alive = false; };
  }, []);
  if (!loaded) return null;
  if (!items.length) {
    return (
      <Section title="Recent questions">
        <p className="rounded-lg border border-dashed border-line-strong px-5 py-6 text-center text-base text-muted">Questions you ask will show up here.</p>
      </Section>
    );
  }
  return (
    <Section title="Recent questions">
      <ul className="elev-1 divide-y divide-line overflow-hidden rounded-lg">
        {items.map(({ q, a }) => (
          <li key={q.id}>
            <Link to={`/answer/${a!.id}`} className="flex min-h-[72px] items-center gap-4 px-5 py-4 transition hover:bg-raised">
              <SubjectTile subject={q.subject} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-1 text-base font-semibold">{mathToPlain(q.text).replace(/\s+/g, ' ').trim() || 'Scanned question'}</span>
                <span className="text-sm text-muted">{label(q.subject)}</span>
              </span>
              <span aria-hidden className="text-lg text-muted">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
