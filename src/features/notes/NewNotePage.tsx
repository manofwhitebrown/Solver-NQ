import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field, Input, PageHeader, Section, Select, Stack, Tabs, Textarea, toast } from '@/components/ui';
import { saveNote } from '@/lib/db';
import { capMessage, capText, MAX_CHARS, cleanTranscript, extractGlossary, keywords, newNote, readStats, termLines, type NoteSource } from '@/lib/notes';
import type { Subject } from '@/types';
import { SUBJECT_OPTIONS } from './subjects';
import { useImport } from './useImport';

type Mode = 'paste' | 'file' | 'transcript';

export function NewNotePage() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('paste');
  const [text, setText] = useState('');
  const [source, setSource] = useState<NoteSource>('paste');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('other');
  const [info, setInfo] = useState<string>();
  const [saving, setSaving] = useState(false);
  const imp = useImport((r) => {
    setText(r.text); setSource(r.source); setInfo(r.info); if (!title) setTitle(r.name.replace(/\.[^.]+$/, ''));
  });

  const stats = readStats(text);
  const tooLong = text.length > MAX_CHARS;
  const cap = capText(text);

  async function create() {
    setSaving(true);
    try {
      const body = capText(text).text;
      const n = newNote({ text: mode === 'transcript' ? cleanTranscript(body) : body, source, subject, title });
      n.keyTerms = termLines(extractGlossary(n.text)).length ? termLines(extractGlossary(n.text)) : keywords(n.text, 8);
      await saveNote(n);
      nav(`/notes/${n.id}`, { replace: true });
    } catch { toast('Could not save the note. Please try again.', 'error'); setSaving(false); }
  }

  return (
    <>
      <PageHeader title="New note" subtitle="Paste or import your study material" back="/notes" />
      <Section>
        <Stack>
          <Tabs label="Where is your material?" value={mode} onChange={(m) => { setMode(m); if (m === 'transcript') setSource('paste'); }}
            items={[{ value: 'paste', label: 'Paste' }, { value: 'file', label: 'File or photo' }, { value: 'transcript', label: 'Transcript' }]} />
          {mode === 'file' && (
            <Card>
              <Stack gap={3}>
                <p className="text-base text-ink-2">Choose a text file, a PDF, or a photo of a page. Scanned PDF pages are read with OCR.</p>
                <input ref={fileRef} type="file" hidden accept=".txt,.md,.markdown,.pdf,application/pdf,image/*,text/plain"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void imp.run(f); e.target.value = ''; }} />
                <Button variant="secondary" loading={!!imp.busy} onClick={() => fileRef.current?.click()}>{imp.busy ?? 'Choose a file'}</Button>
                {imp.error && <p role="alert" className="text-base text-bad">{imp.error}</p>}
              </Stack>
            </Card>
          )}
          {mode === 'transcript' && <p className="text-base text-ink-2">Paste the transcript text yourself (we never fetch anything from the web). Time stamps are removed.</p>}
          <Field label={mode === 'transcript' ? 'Transcript' : 'Your text'} htmlFor="note-text"
            hint={`${stats.chars.toLocaleString()} characters · ${stats.words.toLocaleString()} words${info ? ` · ${info}` : ''}. You can edit it before processing.`}>
            <Textarea id="note-text" className="min-h-[220px] text-[17px] leading-[1.7]" value={text}
              onChange={(e) => { setText(e.target.value); setInfo(undefined); }} placeholder="Paste your notes here..." />
          </Field>
          {tooLong && (
            <Card role="status" className="border-warn/50">
              <Stack gap={3}>
                <p className="text-base text-ink">{capMessage(cap)}</p>
                <Button variant="secondary" onClick={() => { setText(cap.text); toast('Using the first part', 'success'); }}>Use the first part</Button>
              </Stack>
            </Card>
          )}
          <Field label="Title (optional)" htmlFor="note-title"><Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Taken from the first line" /></Field>
          <Field label="Subject" htmlFor="note-subject">
            <Select id="note-subject" value={subject} onChange={(e) => setSubject(e.target.value as Subject)} options={SUBJECT_OPTIONS} />
          </Field>
          <Button block loading={saving} disabled={text.trim().length < 20 || tooLong} onClick={create}>Create note</Button>
          {text.trim().length > 0 && text.trim().length < 20 && <p className="text-sm text-muted">Add a little more text to get a useful summary.</p>}
        </Stack>
      </Section>
    </>
  );
}
