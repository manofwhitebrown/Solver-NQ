import { useEffect, useRef, useState } from 'react';
import type { Step } from '@/types';
import { Button, Input, Spinner, toast } from '@/components/ui';
import { followUp } from '@/lib/ai';
import { Markdown } from './Markdown';

interface Msg { role: 'you' | 'ai'; text: string }

/** Free-form follow-up questions. Each reply is also saved on the answer as an extra step. */
export function FollowUpChat({ answerId, onStep }: { answerId: string; onStep: (s: Step) => Promise<void> }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, busy]);

  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    setText('');
    setMsgs((m) => [...m, { role: 'you', text: q }]);
    setBusy(true);
    try {
      const step = await followUp(answerId, q);
      setMsgs((m) => [...m, { role: 'ai', text: `**${step.title}**\n\n${step.body}` }]);
      await onStep({ ...step, body: `> ${q.replace(/\n/g, ' ')}\n\n${step.body}` });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not get a reply', 'error');
    } finally { setBusy(false); }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="min-h-[120px] flex-1 space-y-3 overflow-y-auto" aria-live="polite">
        {msgs.length === 0 && <p className="text-sm text-muted">Ask anything about this solution, such as "why did we divide by 2?"</p>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'you' ? 'ml-8 rounded-lg bg-accent/10 p-3 text-[15px]' : 'mr-4 rounded-lg bg-raised p-3'}>
            {m.role === 'you' ? m.text : <Markdown>{m.text}</Markdown>}
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-sm text-muted"><Spinner label="Thinking" />Thinking…</div>}
        <div ref={end} />
      </div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a follow-up" aria-label="Follow-up question"
          enterKeyHint="send" onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} />
        <Button onClick={() => void send()} disabled={!text.trim()} loading={busy}>Send</Button>
      </div>
    </div>
  );
}
