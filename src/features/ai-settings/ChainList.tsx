import { useState } from 'react';
import { Button, Card, Checkbox, Stack, toast } from '@/components/ui';
import { formatTime } from '@/lib/ai/errors';
import { moveSlot, removeSlot, slotInfo, testSlot, toggleSlot } from '@/lib/ai/fallback';
import type { FallbackState, ModelSlot } from '@/lib/ai/fallback';

const LABEL = { ready: 'Ready', unavailable: 'Unavailable', 'key-invalid': 'Key invalid', cooling: 'Cooling down' } as const;

const TONE = { ready: 'bg-ok-soft text-ok', unavailable: 'bg-warn-soft text-warn', 'key-invalid': 'bg-warn-soft text-warn', cooling: 'bg-warn-soft text-warn' } as const;

function Row({ state, slot, first, last, rank }: { state: FallbackState; slot: ModelSlot; first: boolean; last: boolean; rank: number }) {
  const [busy, setBusy] = useState(false);
  const info = slotInfo(state, slot);
  const text = info.status === 'cooling' && info.until ? `Cooling down until ${formatTime(info.until)}` : LABEL[info.status];
  const test = async () => { setBusy(true); const r = await testSlot(slot); toast(r.message, r.ok ? 'success' : 'error'); setBusy(false); };
  return (
    <Card className="!p-4">
      <Stack gap={3}>
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{rank}</span>
          <Checkbox label={slot.model} checked={slot.enabled} onChange={() => toggleSlot(slot.id)} className="min-w-0 flex-1 font-semibold" />
        </div>
        <p className={`w-fit rounded-full px-3 py-1 text-caption font-semibold ${TONE[info.status]}`} role="status">{text}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="md" variant="secondary" disabled={first} onClick={() => moveSlot(slot.id, -1)} aria-label={`Move ${slot.model} up`}>Up</Button>
          <Button size="md" variant="secondary" disabled={last} onClick={() => moveSlot(slot.id, 1)} aria-label={`Move ${slot.model} down`}>Down</Button>
          <Button size="md" variant="secondary" loading={busy} onClick={test}>Test</Button>
          <Button size="md" variant="ghost" onClick={() => removeSlot(slot.id)} aria-label={`Remove ${slot.model}`}>Remove</Button>
        </div>
      </Stack>
    </Card>
  );
}

export function ChainList({ state }: { state: FallbackState }) {
  if (!state.chain.length) return <p className="text-sm text-muted">No models yet. Tap Fetch available models.</p>;
  return (
    <Stack gap={3}>
      <p className="text-sm text-muted">The first model that is Ready answers. If it hits a limit, the next one takes over.</p>
      {state.chain.map((s, i) => <Row key={s.id} state={state} slot={s} first={i === 0} last={i === state.chain.length - 1} rank={i + 1} />)}
    </Stack>
  );
}
