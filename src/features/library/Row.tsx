import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, SubjectTile, cn } from '@/components/ui';
import { mathToPlain } from '@/features/answer/plainText';
import { getImageUrl, type LibraryItem } from '@/lib/db';
import { subjectLabel } from './subjects';

interface Props {
  item: LibraryItem; selecting: boolean; selected: boolean;
  onToggle: () => void; onStar: () => void;
}

const snippet = (s: string, n: number) => {
  const t = mathToPlain(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n).trimEnd()}…` : t;
};

/** A roomy row: thumbnail, 2-line title, 2-line answer preview, subject badge, tags, date. At least 64 px tall. */
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
    <div className="flex min-w-0 flex-1 gap-4">
      {thumb
        ? <img src={thumb} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
        : <SubjectTile subject={q.subject} size={48} className="mt-0.5" />}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words text-base font-semibold text-ink">{snippet(q.text, 160) || 'Scanned question'}</p>
        {a && <p className="mt-1 line-clamp-2 break-words text-sm text-ink-2">{snippet(a.finalAnswer, 140)}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-semibold text-accent">{subjectLabel(q.subject)}</span>
          {q.tags.slice(0, 3).map(t => <span key={t} className="max-w-[10rem] truncate">#{t}</span>)}
          {q.tags.length > 3 && <span>+{q.tags.length - 3}</span>}
          <span className="whitespace-nowrap">{new Date(q.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <li className={cn('elev-1 flex min-h-[64px] items-start gap-2 rounded-lg p-4', selected && 'border-accent bg-accent-soft')}
      onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
      {selecting && (
        // Decision: a bare checkbox (<Checkbox> needs visible text; the row already has it). The real input fills a 44 px
        // hit area and is invisible; the 20 px box is drawn next to it.
        <label className="relative -my-1 -ml-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
          <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select: ${snippet(q.text, 40)}`}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded border-2 border-line-strong bg-surface text-caption font-bold leading-none text-transparent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent">✓</span>
        </label>
      )}
      {selecting
        ? <button type="button" data-row onClick={onToggle} className="min-w-0 flex-1 text-left">{body}</button>
        : <Link to={a ? `/answer/${a.id}` : '/'} data-row className="min-w-0 flex-1" onClick={e => { if (longPressed.current) e.preventDefault(); }}>{body}</Link>}
      <IconButton label={q.starred ? 'Unstar' : 'Star'} aria-pressed={q.starred} className="-my-1 -mr-2" onClick={onStar}>{q.starred ? '★' : '☆'}</IconButton>
    </li>
  );
}
