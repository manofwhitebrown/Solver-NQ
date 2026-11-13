import { useState } from 'react';
import type { Answer } from '@/types';
import { Icon } from './icons';

const NOTE = 'AI answers can be wrong - always double-check.';

/** Honest trust badge: "Checked" only when verify() really matched. Never a green tick otherwise. */
export function VerifyBadge({ verified }: { verified: Answer['verified'] }) {
  const [open, setOpen] = useState(false);

  if (verified === 'mismatch') {
    return (
      <div role="alert" className="flex gap-3 rounded-lg border border-bad/40 bg-bad-soft p-4 text-sm text-ink">
        <Icon name="warn" className="mt-0.5 h-5 w-5 shrink-0 text-bad" />
        <p><strong className="font-semibold">Doesn't match - double-check.</strong> Our offline calculation gives a different result. Work it through yourself before relying on this answer.</p>
      </div>
    );
  }
  if (verified === 'match') {
    return (
      <div>
        <button type="button" onClick={() => setOpen((o) => !o)} title={NOTE} aria-expanded={open}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ok/30 bg-ok-soft px-4 text-sm font-semibold text-ok">
          <Icon name="check" className="h-4 w-4" />Checked
        </button>
        {open && <p className="mt-2 text-sm text-muted">Our offline calculation reached the same result. This does not check the method. {NOTE}</p>}
      </div>
    );
  }
  return <p className="rounded-lg bg-raised px-3 py-2 text-sm text-muted" title={NOTE}>{NOTE}</p>;
}
