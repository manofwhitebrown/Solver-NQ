import { useState } from 'react';
import type { Mode, Step } from '@/types';
import { Button, Card, Chip, Cluster, Stack } from '@/components/ui';
import { Markdown } from './Markdown';

const isFollowUp = (s: Step) => s.id.startsWith('fu-');

/** Learn mode shows a "try this" prompt and reveals one step at a time. Answer mode shows everything. */
export function Steps({ steps, initialMode, onAllRevealed }: {
  steps: Step[]; initialMode: Mode; onAllRevealed: (done: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [shown, setShown] = useState(0);
  const [fresh, setFresh] = useState(-1); // index of the step revealed last, so only it animates
  const main = steps.filter((s) => !isFollowUp(s));
  const extra = steps.filter(isFollowUp);
  const learning = mode === 'learn' && shown < main.length;
  const visible = learning ? main.slice(0, shown) : main;
  const next = learning ? main[shown] : undefined;

  const reveal = (n: number) => { setFresh(n === shown + 1 ? shown : -1); setShown(n); onAllRevealed(n >= main.length); };
  const switchMode = (m: Mode) => { setMode(m); onAllRevealed(m === 'answer' || shown >= main.length); };
  const last = shown > 0 ? main[shown - 1] : undefined;

  return (
    <section aria-label="Steps">
      <Stack gap={5}>
        <Cluster className="justify-between">
          <h2 className="text-xl font-semibold">Steps</h2>
          <Cluster>
            <Chip selected={mode === 'learn'} className="min-h-[44px]" onClick={() => switchMode('learn')}>Learn</Chip>
            <Chip selected={mode === 'answer'} className="min-h-[44px]" onClick={() => switchMode('answer')}>Answer</Chip>
          </Cluster>
        </Cluster>
        <p className="sr-only" role="status" aria-live="polite">
          {learning && last ? `Step ${shown} of ${main.length} revealed: ${last.title}` : ''}
        </p>
        {visible.map((s, i) => <StepCard key={s.id} n={i + 1} step={s} animate={i === fresh} />)}
        {next && <TryThis n={shown + 1} total={main.length} title={next.title} onNext={() => reveal(shown + 1)} onAll={() => reveal(main.length)} />}
        {main.length === 0 && <p className="text-base text-muted">No steps for this answer.</p>}
        {extra.map((s) => <StepCard key={s.id} step={s} />)}
      </Stack>
    </section>
  );
}

function TryThis({ n, total, title, onNext, onAll }: { n: number; total: number; title: string; onNext: () => void; onAll: () => void }) {
  return (
    <div className="rounded-lg border-l-4 border-accent bg-accent-soft p-5 lg:p-6">
      <p className="text-sm font-semibold text-accent">Step {n} of {total} · try this first</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={n - 1} aria-label="Steps revealed">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((n - 1) / total) * 100}%` }} />
      </div>
      <p className="mt-4 text-lg font-semibold">How would you do this: {title}?</p>
      <p className="mt-1 text-base text-ink-2">Think about it, or jot it down, then reveal the step.</p>
      <Cluster gap={3} className="mt-4">
        <Button onClick={onNext}>Show next step</Button>
        <Button variant="secondary" onClick={onAll}>Show everything</Button>
      </Cluster>
    </div>
  );
}

function StepCard({ step, n, animate }: { step: Step; n?: number; animate?: boolean }) {
  return (
    <Card className={animate ? 'step-in' : undefined}>
      <div className="mb-3 flex items-center gap-3">
        {n && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent" aria-hidden>{n}</span>}
        <h3 className="text-lg font-semibold">{n ? <span className="sr-only">Step {n}: </span> : null}{step.title}</h3>
      </div>
      <Markdown>{step.body}</Markdown>
    </Card>
  );
}
