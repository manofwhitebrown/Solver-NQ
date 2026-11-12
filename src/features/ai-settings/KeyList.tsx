import { Button, Card, Stack } from '@/components/ui';
import { maskKey, removeKey } from '@/lib/ai/fallback';
import type { FallbackState } from '@/lib/ai/fallback';

export function KeyList({ state }: { state: FallbackState }) {
  if (!state.keys.length) return <p className="text-sm text-muted">No keys yet. Add one below.</p>;
  return (
    <Stack gap={3}>
      {state.keys.map(k => (
        <Card key={k.id} className="flex items-center gap-3 !p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{k.label}</p>
            <p className="text-sm text-muted">{k.provider === 'gemini' ? 'Gemini' : k.provider} · {maskKey(k.key)}</p>
            {state.invalidKeys.includes(k.id) && <p className="text-sm text-bad">This key was rejected. Delete it and paste a new one.</p>}
          </div>
          <Button variant="ghost" onClick={() => removeKey(k.id)} aria-label={`Delete key ${k.label}`}>Delete</Button>
        </Card>
      ))}
    </Stack>
  );
}
