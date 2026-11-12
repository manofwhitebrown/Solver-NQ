import { useState } from 'react';
import type { Answer } from '@/types';
import { Icon } from './icons';

const NOTE = 'AI answers can be wrong - always double-check.';

/** Honest trust badge: "Checked" only when verify() really matched. Never a green tick otherwise. */
export function VerifyBadge({ verified }: { verified: Answer['verified'] }) {
  const [open, setOpen] = useState(false);

  if (verified === 'mismatch') {
    return (
      <div role="alert" className="flex gap-3 rounded-md border border-bad/40 bg-bad/10 p-3 text-sm">
        <Icon name="warn" className="mt-0.5 h-5 w-5 shrink-0 text-bad" />
        <p><strong className="font-semibold">This answer did not pass our check.</strong> Our offline calculation disagrees with it. Work it through yourself before relying on it.</p>
      </div>
    );
  }
  if (verified === 'match') {
    return (
      <div>
        <button type="button" onClick={() => setOpen((o) => !o)} title={NOTE} aria-expanded={open}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-ok/10 px-3 text-sm font-semibold text-ok">
          <Icon name="check" className="h-4 w-4" />Checked
        </button>
        {open && <p className="mt-1 text-[13px] text-muted">Matched by an offline calculation. {NOTE}</p>}
      </div>
    );
  }
  return <p className="text-[13px] text-muted" title={NOTE}>{NOTE}</p>;
}
