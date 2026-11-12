import { Stack } from '@/components/ui';
import { updateSettings, useSettings } from '@/lib/settings';
import type { Mode } from '@/types';

const OPTIONS: Array<{ value: Mode; title: string; text: string }> = [
  { value: 'learn', title: 'Learn', text: 'Teach me. Steps appear one at a time so I can think first.' },
  { value: 'answer', title: 'Answer', text: 'Just solve it. Show the full solution at once.' },
];

export function StepMode() {
  const { defaultMode } = useSettings();
  return (
    <Stack gap={3} role="radiogroup" aria-label="Default mode">
      {OPTIONS.map((o) => (
        <button
          key={o.value} type="button" role="radio" aria-checked={defaultMode === o.value}
          onClick={() => updateSettings({ defaultMode: o.value })}
          className={`rounded-lg border p-5 text-left transition ${defaultMode === o.value ? 'border-accent bg-accent-soft' : 'border-line-strong bg-surface hover:bg-raised'}`}
        >
          <div className="text-lg font-bold text-ink">{o.title}</div>
          <div className="mt-1 text-base text-ink-2">{o.text}</div>
        </button>
      ))}
    </Stack>
  );
}
