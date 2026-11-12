import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, cn } from '@/components/ui';
import { getImageUrl, type LibraryItem } from '@/lib/db';
import { subjectLabel } from './subjects';

interface Props {
  item: LibraryItem; selecting: boolean; selected: boolean;
  onToggle: () => void; onStar: () => void;
}

const snippet = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

export function Row({ item, selecting, selected, onToggle, onStar }: Props) {
  const { q, a } = item;
  const [thumb, setThumb] = useState<string>();
  const timer = useRef<number>(undefined);
  const longPressed = useRef(false);

  useEffect(() => {
    let live = true;
    if (q.imageBlobId) void getImageUrl(q.imageBlobId, true).then(u => { if (live) setThumb(u); });
    return () => { live = false; };
  }, [q.imageBlobId]);

  // Long-press starts selection on touch screens.
  const down = () => {
    longPressed.current = false;
    timer.current = window.setTimeout(() => { longPressed.current = true; onToggle(); }, 450);
  };
  const up = () => window.clearTimeout(timer.current);

  const body = (
    <div className="flex min-w-0 flex-1 gap-3">
      {thumb && <img src={thumb} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15px] font-medium">{snippet(q.text || 'Scanned question', 140)}</p>
        {a && <p className="mt-1 line-clamp-1 text-sm text-muted">{snippet(a.finalAnswer, 90)}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <span className="rounded-full bg-raised px-2 py-0.5">{subjectLabel(q.subject)}</span>
          {q.tags.slice(0, 3).map(t => <span key={t}>#{t}</span>)}
          <span className="ml-auto whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <li className={cn('flex items-start gap-2 rounded-md border p-3', selected ? 'border-accent bg-accent/10' : 'border-line bg-surface')}
      onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
      {selecting && (
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label="Select" className="mt-2.5 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]" />
      )}
      {selecting
        ? <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">{body}</button>
        : <Link to={a ? `/answer/${a.id}` : '/'} className="min-w-0 flex-1" onClick={e => { if (longPressed.current) e.preventDefault(); }}>{body}</Link>}
      <IconButton label={q.starred ? 'Unstar' : 'Star'} aria-pressed={q.starred} onClick={onStar}>{q.starred ? '★' : '☆'}</IconButton>
    </li>
  );
}
