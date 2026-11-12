import { useEffect, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Chip, Tabs, Textarea } from '@/components/ui';
import { MODES, SUBJECTS } from '@/features/settings/options';

import { IMAGE_ONLY_TEXT } from '@/lib/ai';
import { useSettings } from '@/lib/settings';
import type { Mode, Subject } from '@/types';
import { ImagePreview } from './ImagePreview';
import { RecentList } from './RecentList';
import { ScanSlot } from './ScanSlot';
import { Thinking } from './Thinking';
import { useAsk } from './useAsk';

const HINT: Record<Mode, string> = {
  learn: 'Learn: one step at a time, so you work it out yourself.',
  answer: 'Answer: the full solution at once.',
};

export function AskPage() {
  const settings = useSettings();
  const [text, setText] = useState('');
  const [subject, setSubject] = useState<Subject>(settings.defaultSubject);
  const [mode, setMode] = useState<Mode>(settings.defaultMode);
  const [image, setImage] = useState<string | undefined>();
  const { status, error, submit, cancel, reset } = useAsk();
  const location = useLocation();
  const navigate = useNavigate();

  // /scan hands back { text, imageDataUrl } through router state. Take it once, then clear it.
  useEffect(() => {
    const s = location.state as { text?: unknown; imageDataUrl?: unknown } | null;
    if (!s || typeof s.text !== 'string') return;
    setText(s.text);
    setImage(typeof s.imageDataUrl === 'string' ? s.imageDataUrl : undefined);
    navigate('.', { replace: true, state: null });
  }, [location.state, navigate]);

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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">What are you working on?</h1>
      <p className="mt-1 text-[15px] text-muted">Type a question, or scan it from a page.</p>

      <div className="mt-6">
        {status === 'busy' ? (
          <Thinking onCancel={cancel} />
        ) : status === 'queued' ? (
          <Card className="flex flex-col items-start gap-3" role="status">
            <p className="font-semibold">Saved - will answer when you&apos;re online</p>
            <p className="text-[15px] text-muted">You can keep asking. Answers appear in your library.</p>
            <Button variant="secondary" onClick={reset}>Ask another</Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            <Textarea
              aria-label="Your question"
              placeholder="e.g. Solve 2x + 5 = 17"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              className="min-h-[160px] text-[17px]"
            />

            {image && <ImagePreview src={image} onRemove={() => setImage(undefined)} />}

            <div role="group" aria-label="Subject" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {SUBJECTS.map((s) => (
                <Chip key={s.value} selected={s.value === subject} onClick={() => setSubject(s.value)} className="shrink-0">
                  {s.label}
                </Chip>
              ))}
            </div>

            <div>
              <Tabs label="Mode" value={mode} onChange={setMode} items={MODES} />
              <p className="mt-2 text-sm text-muted">{HINT[mode]}</p>
            </div>

            {error && <p role="alert" className="text-[15px] text-bad">{error}</p>}

            <div className="flex gap-3">
              <ScanSlot />
              <Button className="flex-1" disabled={!canSend} onClick={() => void send()}>
                Send
                <span className="hidden text-xs font-medium opacity-70 lg:inline">Ctrl+Enter</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <RecentList />
    </div>
  );
}
