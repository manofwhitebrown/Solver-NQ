import { Tabs } from '@/components/ui';
import { MODES } from '@/features/settings/options';
import type { Mode } from '@/types';

const HINT: Record<Mode, string> = {
  learn: 'Teach me: one step at a time, so you work it out yourself.',
  answer: 'Just solve: the full solution at once.',
};

export function ModeToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div>
      <Tabs label="Mode" value={value} onChange={onChange} items={MODES} />
      <p className="mt-3 text-sm text-muted">{HINT[value]}</p>
    </div>
  );
}
