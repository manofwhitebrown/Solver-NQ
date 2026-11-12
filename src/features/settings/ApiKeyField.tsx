import { useState } from 'react';
import { Button, Field, Input, toast } from '@/components/ui';

export function ApiKeyField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);

  async function paste() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) onChange(text);
      else toast('Clipboard is empty', 'error');
    } catch {
      toast('Could not read the clipboard. Paste into the field instead.', 'error');
    }
  }

  return (
    <Field label="API key" htmlFor="api-key" hint="Stored only on this device. It is sent only to your AI provider.">
      <Input
        id="api-key" type={show ? 'text' : 'password'} value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        placeholder="Paste your key"
      />
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={paste}>Paste</Button>
        <Button variant="secondary" className="flex-1" onClick={() => setShow((s) => !s)}>
          {show ? 'Hide' : 'Show'}
        </Button>
        <Button variant="ghost" className="flex-1" disabled={!value} onClick={() => onChange('')}>Clear</Button>
      </div>
    </Field>
  );
}
