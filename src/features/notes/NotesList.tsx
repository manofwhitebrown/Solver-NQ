import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Chip, Cluster, EmptyState, Input, PageHeader, Skeleton, Stack, Toolbar } from '@/components/ui';
import { listNotes } from '@/lib/db';
import type { Note } from '@/types';

export function NotesList() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string>();

  useEffect(() => {
    let live = true;
    const t = setTimeout(() => { listNotes({ text: q, tag }).then((n) => { if (live) setNotes(n); }).catch(() => { if (live) setNotes([]); }); }, 150);
    return () => { live = false; clearTimeout(t); };
  }, [q, tag]);

  const tags = [...new Set((notes ?? []).flatMap((n) => n.tags))].slice(0, 12);
  return (
    <>
      <PageHeader title="Notes" subtitle="Summaries, cheat sheets and cards from your own material"
        actions={<Link to="/notes/new"><Button size="md">New note</Button></Link>} />
      <Stack gap={5}>
        <Toolbar><Input aria-label="Search notes" type="search" placeholder="Search notes" value={q} onChange={(e) => setQ(e.target.value)} /></Toolbar>
        {tags.length > 0 && <Cluster>{tags.map((t) => <Chip key={t} className="min-h-[44px]" selected={tag === t} onClick={() => setTag(tag === t ? undefined : t)}>{t}</Chip>)}</Cluster>}
        {!notes ? <Skeleton className="h-28 w-full" /> : notes.length === 0 ? (
          <EmptyState title={q || tag ? 'No notes match' : 'No notes yet'} text={q || tag ? 'Try a different search.' : 'Paste a page of notes or import a PDF to get a summary and cards.'}
            action={<Link to="/notes/new" className="inline-flex"><Button>Add your first note</Button></Link>} />
        ) : notes.map((n) => (
          <Link key={n.id} to={`/notes/${n.id}`} className="block">
            <Card interactive className="min-h-[64px]">
              <Stack gap={2}>
                <h2 className="text-lg font-semibold text-ink">{n.title}</h2>
                <p className="line-clamp-2 text-[15px] text-ink-2">{n.summary ?? n.text.slice(0, 160)}</p>
                <p className="text-sm text-muted">{n.subject} · {new Date(n.updatedAt).toLocaleDateString()}</p>
              </Stack>
            </Card>
          </Link>
        ))}
      </Stack>
    </>
  );
}
