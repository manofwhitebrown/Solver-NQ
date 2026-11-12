import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Step } from '@/types';
import { Button, Card, Chip, Spinner, toast } from '@/components/ui';
import { followUp, similarProblem } from '@/lib/ai';
import { copyText } from './clipboard';

type Busy = 'simpler' | 'method' | 'similar' | null;

const PROMPTS = {
  simpler: 'Explain this solution more simply, as if to a complete beginner. Use plain words and a small example if it helps.',
  method: 'Solve the same problem again using a different method. Say which method you chose and why.',
} as const;

const fail = (e: unknown) => toast(e instanceof Error ? e.message : 'Something went wrong', 'error');

export function ActionChips({ answerId, onStep }: { answerId: string; onStep: (s: Step) => Promise<void> }) {
  const [busy, setBusy] = useState<Busy>(null);
  const [practice, setPractice] = useState<string | null>(null);

  const askFollowUp = async (kind: 'simpler' | 'method') => {
    setBusy(kind);
    try { await onStep(await followUp(answerId, PROMPTS[kind])); } catch (e) { fail(e); } finally { setBusy(null); }
  };
  const askSimilar = async () => {
    setBusy('similar');
    try { setPractice((await similarProblem(answerId)).text); } catch (e) { fail(e); } finally { setBusy(null); }
  };

  const chip = (kind: Exclude<Busy, null>, label: string, run: () => void) => (
    <Chip key={kind} disabled={busy !== null} onClick={run} className="min-h-[44px]">
      {busy === kind && <span className="mr-2"><Spinner label="Working" /></span>}{label}
    </Chip>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {chip('simpler', 'Explain simpler', () => void askFollowUp('simpler'))}
        {chip('method', 'Another method', () => void askFollowUp('method'))}
        {chip('similar', 'Similar practice problem', () => void askSimilar())}
      </div>
      {practice && (
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-muted">Practice problem</p>
          <p className="text-read">{practice}</p>
          <div className="flex flex-wrap gap-2">
            <Link to={`/?text=${encodeURIComponent(practice)}`} className="inline-flex min-h-[44px] items-center rounded-md bg-accent px-5 text-[15px] font-semibold text-accent-ink">Solve it</Link>
            <Button variant="secondary" onClick={() => void copyText(practice).then((ok) => toast(ok ? 'Copied' : 'Could not copy', ok ? 'success' : 'error'))}>Copy</Button>
            <Button variant="ghost" onClick={() => setPractice(null)}>Dismiss</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
