import { useState } from 'react';
import type { Mode, Step } from '@/types';
import { Button, Card, Chip } from '@/components/ui';
import { Markdown } from './Markdown';

const isFollowUp = (s: Step) => s.id.startsWith('fu-');

/** Learn mode shows a "try this" prompt and reveals one step at a time. Answer mode shows everything. */
export function Steps({ steps, initialMode, onAllRevealed }: {
  steps: Step[]; initialMode: Mode; onAllRevealed: (done: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [shown, setShown] = useState(0);
  const main = steps.filter((s) => !isFollowUp(s));
  const extra = steps.filter(isFollowUp);
  const learning = mode === 'learn' && shown < main.length;
  const visible = learning ? main.slice(0, shown) : main;
  const next = learning ? main[shown] : undefined;

  const reveal = (n: number) => { setShown(n); onAllRevealed(n >= main.length); };
  const switchMode = (m: Mode) => { setMode(m); onAllRevealed(m === 'answer' || shown >= main.length); };

  return (
    <section aria-label="Steps" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Steps</h2>
        <div className="flex gap-2">
          <Chip selected={mode === 'learn'} onClick={() => switchMode('learn')}>Learn</Chip>
          <Chip selected={mode === 'answer'} onClick={() => switchMode('answer')}>Answer</Chip>
        </div>
      </div>
      {visible.map((s, i) => <StepCard key={s.id} n={i + 1} step={s} />)}
      {next && (
        <Card className="space-y-3 border-dashed p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Step {shown + 1} · try this first</p>
          <p className="font-medium">How would you do this: {next.title}?</p>
          <p className="text-sm text-muted">Think about it, or jot it down, then reveal the step.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => reveal(shown + 1)}>Show next step</Button>
            <Button variant="ghost" onClick={() => reveal(main.length)}>Show everything</Button>
          </div>
        </Card>
      )}
      {main.length === 0 && <p className="text-sm text-muted">No steps for this answer.</p>}
      {extra.map((s) => <StepCard key={s.id} step={s} />)}
    </section>
  );
}

function StepCard({ step, n }: { step: Step; n?: number }) {
  return (
    <Card className="p-4">
      <h3 className="mb-1 font-semibold">{n ? `${n}. ` : ''}{step.title}</h3>
      <Markdown>{step.body}</Markdown>
    </Card>
  );
}
