import { useState, type ReactNode } from 'react';
import { Button, Card, Dialog, Field, Input, Select, Tabs, toast } from '@/components/ui';
import { SUGGESTED_MODELS, updateSettings, useSettings, type Provider, type ThemePref } from '@/lib/settings';
import type { Mode, Subject } from '@/types';
import { ApiKeyField } from './ApiKeyField';
import { clearAllData } from './clearData';
import { MODES, OCR_LANGS, PROVIDERS, SUBJECTS } from './options';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold text-muted">{title}</h2>
      <Card className="space-y-5">{children}</Card>
    </section>
  );
}

export function SettingsPage() {
  const s = useSettings();
  const [confirm, setConfirm] = useState(false);

  function changeProvider(p: Provider) {
    // Swap the model only if it is still the old provider's suggestion.
    const untouched = s.model === SUGGESTED_MODELS[s.provider] || !s.model;
    updateSettings({ provider: p, ...(untouched ? { model: SUGGESTED_MODELS[p] } : {}) });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Section title="AI provider">
        <Field label="Provider" htmlFor="provider">
          <Select id="provider" value={s.provider} options={PROVIDERS} onChange={(e) => changeProvider(e.target.value as Provider)} />
        </Field>
        <Field label="Model" htmlFor="model" hint={`Suggested: ${SUGGESTED_MODELS[s.provider]}`}>
          <Input id="model" value={s.model} onChange={(e) => updateSettings({ model: e.target.value })} autoCapitalize="off" spellCheck={false} />
        </Field>
        <ApiKeyField value={s.apiKey} onChange={(apiKey) => updateSettings({ apiKey })} />
        {s.provider === 'openai' && (
          <Field label="Base URL" htmlFor="base-url" hint="Leave empty for OpenAI. Set it for compatible servers.">
            <Input id="base-url" type="url" inputMode="url" value={s.baseUrl} placeholder="https://api.openai.com/v1" onChange={(e) => updateSettings({ baseUrl: e.target.value.trim() })} />
          </Field>
        )}
        <Field label="Proxy URL (optional)" htmlFor="proxy" hint="Only needed if your provider blocks direct browser requests.">
          <Input id="proxy" type="url" inputMode="url" value={s.proxyUrl} placeholder="https://" onChange={(e) => updateSettings({ proxyUrl: e.target.value.trim() })} />
        </Field>
      </Section>

      <Section title="Appearance">
        <Tabs<ThemePref> label="Theme" value={s.theme} onChange={(theme) => updateSettings({ theme })}
          items={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Section>

      <Section title="Defaults">
        <Field label="Subject" htmlFor="subject">
          <Select id="subject" value={s.defaultSubject} options={SUBJECTS} onChange={(e) => updateSettings({ defaultSubject: e.target.value as Subject })} />
        </Field>
        <Field label="Mode" htmlFor="mode" hint="Learn reveals one step at a time. Answer shows everything at once.">
          <Tabs<Mode> label="Default mode" value={s.defaultMode} items={MODES} onChange={(defaultMode) => updateSettings({ defaultMode })} />
        </Field>
        <Field label="Scan language" htmlFor="ocr">
          <Select id="ocr" value={s.ocrLang} options={OCR_LANGS} onChange={(e) => updateSettings({ ocrLang: e.target.value })} />
        </Field>
      </Section>

      <Section title="Your data">
        <p className="text-[15px] leading-relaxed text-muted">
          Removes your library, flashcards, queue and settings from this device. Export a backup first if you want to keep them.
        </p>
        <Button variant="danger" onClick={() => setConfirm(true)}>Clear all data</Button>
      </Section>

      <Dialog
        open={confirm} onClose={() => setConfirm(false)} title="Clear all data?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => clearAllData().catch(() => toast('Could not clear data', 'error'))}>Clear everything</Button>
          </>
        }
      >
        This permanently deletes everything stored by Solver-NQ on this device, including your API key.
      </Dialog>
    </div>
  );
}
