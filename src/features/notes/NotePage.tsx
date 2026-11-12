import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Chip, Cluster, EmptyState, Field, Input, PageHeader, Section, Skeleton, Stack, Tabs } from '@/components/ui';
import { glossaryToMarkdown, localOutputs, localQuestions, parseTermLines, type SummaryLength } from '@/lib/notes';
import { MarkdownView } from './MarkdownView';
import { NoteActions } from './NoteActions';
import { useImprove } from './useImprove';
import { useNote } from './useNote';

type Tab = 'summary' | 'cheat' | 'terms' | 'quiz' | 'text';
const LENGTHS: Array<[SummaryLength, string]> = [['short', 'Short'], ['medium', 'Medium'], ['detailed', 'Detailed']];

export function NotePage() {
  const { id } = useParams();
  const { note, update } = useNote(id);
  const { improve, aiQuestions, busy, questions } = useImprove(note, update);
  const [tab, setTab] = useState<Tab>('summary');
  const [len, setLen] = useState<SummaryLength>('medium');
  const local = useMemo(() => (note ? localOutputs(note.text, note.title, len) : undefined), [note, len]);

  if (note === undefined) return <Skeleton className="h-48 w-full" />;
  if (note === null || !local) {
    return <EmptyState title="Note not found" text="It may have been deleted." action={<Link to="/notes"><Button variant="secondary">All notes</Button></Link>} />;
  }
  const hasAi = !!note.summary;
  const terms = parseTermLines(note.keyTerms).length ? note.keyTerms!.join('\n') : glossaryToMarkdown(local.glossary);

  return (
    <>
      <PageHeader title={note.title} subtitle={`${note.subject} · ${note.text.length.toLocaleString()} characters`} back="/notes" />
      <Stack gap={5}>
        <div data-no-print><Tabs label="Note view" value={tab} onChange={setTab}
          items={[{ value: 'summary', label: 'Summary' }, { value: 'cheat', label: 'Cheat sheet' }, { value: 'terms', label: 'Terms' }, { value: 'quiz', label: 'Test me' }, { value: 'text', label: 'Text' }]} /></div>
        <Card>
          <Stack gap={4}>
            {tab !== 'text' && !hasAi && <p className="text-sm font-semibold text-ink-2">Quick summary (offline)</p>}
            {tab === 'summary' && (<>
              {!hasAi && <Cluster data-no-print>{LENGTHS.map(([v, l]) => <Chip key={v} selected={len === v} onClick={() => setLen(v)}>{l}</Chip>)}</Cluster>}
              <MarkdownView>{note.summary ?? local.summary}</MarkdownView>
            </>)}
            {tab === 'cheat' && <MarkdownView>{note.cheatsheet ?? local.cheatsheet}</MarkdownView>}
            {tab === 'terms' && (terms ? <MarkdownView>{terms}</MarkdownView> : <p className="text-base text-ink-2">No definitions found. Try “Improve with AI”.</p>)}
            {tab === 'quiz' && (<>
              <MarkdownView>{questions ?? localQuestions(local.glossary)}</MarkdownView>
              <Button variant="secondary" loading={busy} onClick={aiQuestions} data-no-print>More questions with AI</Button>
            </>)}
            {tab === 'text' && <p className="whitespace-pre-wrap text-[17px] leading-[1.7] text-ink">{note.text}</p>}
          </Stack>
        </Card>
        <div data-no-print><Button variant={hasAi ? 'secondary' : 'primary'} loading={busy} onClick={() => improve(len)}>{hasAi ? 'Redo with AI' : 'Improve with AI'}</Button></div>
        <Section title="Tags" data-no-print>
          <Field label="Tags (comma separated)" htmlFor="tags">
            <Input id="tags" defaultValue={note.tags.join(', ')} key={note.id}
              onBlur={(e) => void update({ tags: [...new Set(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))] })} />
          </Field>
        </Section>
        <NoteActions note={note} />
      </Stack>
    </>
  );
}
