import { formatTime } from '@/lib/ai/errors';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Page, PageHeader, Section, Stack, Textarea } from '@/components/ui';

import { IMAGE_ONLY_TEXT } from '@/lib/ai';
import { useSettings } from '@/lib/settings';
import type { Mode, Subject } from '@/types';
import { NoKeyCard, useNoKey } from './NoKeyCard';
import { FallbackNote } from './FallbackNote';
import { ModeToggle } from './ModeToggle';
import { SubjectChips } from './SubjectChips';
import { ImagePreview } from './ImagePreview';
import { readPrefill } from './prefill';
import { RecentList } from './RecentList';
import { ScanSlot } from './ScanSlot';
import { Thinking } from './Thinking';
import { useAsk } from './useAsk';

export function AskPage() {
  const settings = useSettings();
  const [text, setText] = useState('');
  const [subject, setSubject] = useState<Subject>(settings.defaultSubject);
  const [mode, setMode] = useState<Mode>(settings.defaultMode);
  const [image, setImage] = useState<string | undefined>();
  const { status, error, submit, cancel, reset, retryAt } = useAsk();
  const noKey = useNoKey();
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // /scan hands back { text, imageDataUrl } through router state. Take it once, then clear it.
  useEffect(() => {
    const s = location.state as { text?: unknown; imageDataUrl?: unknown; autoSend?: unknown } | null;
    if (!s || typeof s.text !== 'string') return;
    const t = s.text;
    const img = typeof s.imageDataUrl === 'string' ? s.imageDataUrl : undefined;
    navigate('.', { replace: true, state: null });
    // The scan screen's "Ask" button means ask: send now. Without a key, just fill the box so NoKeyCard shows.
    if (s.autoSend === true && !noKey && (t.trim() || img)) {
      void submit({ text: t.trim() || IMAGE_ONLY_TEXT, subject, mode, imageDataUrl: img })
        .then(ok => { if (!ok) { setText(t); setImage(img); } }); // keep the question if it failed
      return;
    }
    setText(t);
    setImage(img);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // /?text=... (e.g. "Solve it" on a practice problem) fills the box once; the user still presses Send.
  useEffect(() => {
    const pre = readPrefill(params);
    if (!pre) return;
    setText(pre.text);
    if (pre.subject) setSubject(pre.subject);
    setParams({}, { replace: true });
  }, [params, setParams]);

  const canSend = text.trim().length > 0 || !!image;
  const send = async () => {
    if (!canSend || status === 'busy') return;
    const ok = await submit({ text: text.trim() || IMAGE_ONLY_TEXT, subject, mode, imageDataUrl: image });
    if (ok) { setText(''); setImage(undefined); }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); }
  };

  return (
    <Page>
      <PageHeader title="What are you working on?" subtitle="Type a question, or scan it from a page." />
      <Section>
        {noKey ? (
          <NoKeyCard />
        ) : status === 'busy' ? (
          <Thinking onCancel={cancel} />
        ) : status === 'queued' ? (
          <Card className="flex flex-col items-start gap-4" role="status">
            <p className="text-lg font-semibold">{retryAt ? 'Saved - all free limits are used up' : "Saved - will answer when you're online"}</p>
            <p className="text-base text-muted">
              {retryAt
                ? `I'll answer automatically when quota resets (about ${formatTime(retryAt)}). Answers appear in your library.`
                : 'You can keep asking. Answers appear in your library.'}
            </p>
            <Button variant="secondary" onClick={reset}>Ask another</Button>
          </Card>
        ) : (
          <Stack gap={6}>
            <Card className="elev-2 focus-within:border-accent">
              <Stack gap={4}>
                <Textarea aria-label="Your question" placeholder="e.g. Solve 2x + 5 = 17" value={text}
                  onChange={e => setText(e.target.value)} onKeyDown={onKey} className="min-h-[160px] resize-none border-transparent bg-transparent px-0 text-read focus:ring-0" />
                {image && <ImagePreview src={image} onRemove={() => setImage(undefined)} />}
                {error && <p role="alert" className="text-base text-bad">{error}</p>}
                <div className="flex gap-3">
                  <ScanSlot />
                  <Button className="flex-1" disabled={!canSend} onClick={() => void send()}>
                    Send
                    <span className="hidden text-xs font-medium opacity-70 [@media(hover:hover)_and_(pointer:fine)]:inline">Ctrl+Enter</span>
                  </Button>
                </div>
                <FallbackNote />
              </Stack>
            </Card>
            <SubjectChips value={subject} onChange={setSubject} />
            <ModeToggle value={mode} onChange={setMode} />
          </Stack>
        )}
      </Section>
      <RecentList />
    </Page>
  );
}
