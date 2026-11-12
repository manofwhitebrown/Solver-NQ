import { Stack } from '@/components/ui';
import { ApiKeyField } from '@/features/settings/ApiKeyField';
import { updateSettings, useSettings } from '@/lib/settings';

const HOW = [
  'Open Google AI Studio (aistudio.google.com) and sign in with a Google account.',
  'Tap "Get API key".',
  'Choose "Create API key in new project".',
  'Copy the key and paste it below.',
];

// Stub: replaced by AI-2's <AddKeyForm /> once it is pushed.
export function StepKey() {
  const { apiKey } = useSettings();
  return (
    <Stack gap={5}>
      <p className="text-base text-ink-2">Gemini has a free tier, so you do not need to pay. The key stays on this device.</p>
      <ol className="space-y-3">
        {HOW.map((t, i) => (
          <li key={t} className="flex gap-3 text-base text-ink">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
      <ApiKeyField value={apiKey} onChange={(v) => updateSettings({ apiKey: v, provider: 'gemini' })} />
    </Stack>
  );
}
