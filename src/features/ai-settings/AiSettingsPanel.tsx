import { Button, Checkbox, Section, Stack } from '@/components/ui';
import { resetCooldowns, setSaveQuota } from '@/lib/ai/fallback';
import { AddKeyForm } from './AddKeyForm';
import { ChainList } from './ChainList';
import { HelpCard } from './HelpCard';
import { KeyList } from './KeyList';
import { ModelPicker } from './ModelPicker';
import { useFallbackState } from './useFallbackState';

/** Everything about the AI in one place. AI-1 mounts this in Settings. */
export function AiSettingsPanel() {
  const state = useFallbackState();
  return (
    <div>
      <Section title="Your keys">
        <Stack gap={4}>
          <KeyList state={state} />
          <AddKeyForm />
          <p className="text-sm text-muted">Keys stay on this device. On Google&apos;s free tier, your questions may be used to improve Google products.</p>
        </Stack>
      </Section>
      <Section title="Model chain">
        <Stack gap={4}>
          <ChainList state={state} />
          <ModelPicker />
        </Stack>
      </Section>
      <Section title="Limits">
        <Stack gap={3}>
          <Checkbox label="Save quota (cheap tasks use lighter models first)" checked={state.saveQuota} onChange={e => setSaveQuota(e.target.checked)} />
          <div><Button variant="secondary" onClick={resetCooldowns}>Reset cooldowns</Button></div>
        </Stack>
      </Section>
      <Section><HelpCard /></Section>
    </div>
  );
}
