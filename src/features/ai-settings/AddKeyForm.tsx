import { useState } from 'react';
import { Button, Field, Input, Stack, toast } from '@/components/ui';
import { addKey, clearInvalid, prefillChain, testKey } from '@/lib/ai/fallback';

interface Props {
  /** Called after the key is saved (onboarding uses this to move on). */
  onAdded?: (keyId: string) => void;
  /** Ask for a label (the Google project). Onboarding can hide it. */
  showLabel?: boolean;
}

/** Paste a free Gemini key, test it, save it. The key is masked while typing and never shown again in full. */
export function AddKeyForm({ onAdded, showLabel = true }: Props) {
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const test = async () => {
    setBusy(true); setResult(null);
    setResult(await testKey({ provider: 'gemini', key: key.trim() }));
    setBusy(false);
  };

  const save = async () => {
    setBusy(true);
    const k = addKey({ provider: 'gemini', key, label });
    clearInvalid(k.id);
    setKey(''); setLabel(''); setResult(null);
    toast('Key saved on this device.', 'success');
    onAdded?.(k.id);
    // Pre-fill the model chain from what Google really offers for this key.
    if ((await prefillChain(k.id)) === 'filled') toast('Found the models available to you.', 'info');
    setBusy(false);
  };

  return (
    <Stack gap={4}>
      <Field label="Gemini API key" htmlFor="gem-key" hint="Free from Google AI Studio. It stays on this device.">
        <Input id="gem-key" type="password" autoComplete="off" autoCapitalize="none" spellCheck={false}
          placeholder="Paste your key" value={key} onChange={e => { setKey(e.target.value); setResult(null); }} />
      </Field>
      {showLabel && (
        <Field label="Project name (optional)" htmlFor="gem-label" hint="Each Google project has its own free limit. Name it so you can tell keys apart.">
          <Input id="gem-label" placeholder="Project A" value={label} onChange={e => setLabel(e.target.value)} />
        </Field>
      )}
      {result && <p role="status" className={`text-sm ${result.ok ? 'text-ok' : 'text-bad'}`}>{result.message}</p>}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" disabled={!key.trim() || busy} loading={busy} onClick={test}>Test key</Button>
        <Button disabled={!key.trim() || busy} onClick={save}>Save key</Button>
      </div>
    </Stack>
  );
}
