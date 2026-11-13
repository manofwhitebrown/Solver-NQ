import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Dialog, Field, Input, PageHeader, Section as Group, Select, Stack, Tabs, toast } from '@/components/ui';
import { SUGGESTED_MODELS, updateSettings, useSettings, type Provider, type ThemePref } from '@/lib/settings';
import type { Mode, Subject } from '@/types';
import { DataIcon, InfoIcon, PaletteIcon, SlidersIcon, SparklesIcon } from '@/components/ui/icons';
import { AiSettingsPanel } from '@/features/ai-settings';
import { ApiKeyField } from './ApiKeyField';
import { clearAllData } from './clearData';
import { MODES, OCR_LANGS, PROVIDERS, SUBJECTS } from './options';

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Group className="mb-6">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">{icon}</span>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
      </div>
      <Card><Stack gap={5}>{children}</Stack></Card>
    </Group>
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
    <>
      <PageHeader title="Settings" />

      <Section title="Appearance" icon={<PaletteIcon size={20} />}>
        <Tabs<ThemePref> label="Theme" value={s.theme} onChange={(theme) => updateSettings({ theme })}
          items={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Section>

      <Section title="AI" icon={<SparklesIcon size={20} />}>
        <p className="text-sm text-muted">Free Gemini works best. <Link to="/welcome" className="inline-flex min-h-[44px] items-center font-semibold text-accent underline">Show setup guide</Link></p>
        <AiSettingsPanel />
        <details className="group">
          <summary className="flex min-h-[44px] cursor-pointer items-center text-base font-semibold text-ink-2">Other providers (advanced)</summary>
          <Stack gap={5} className="pt-3">
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
          </Stack>
        </details>
      </Section>

      <Section title="Defaults" icon={<SlidersIcon size={20} />}>
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

      <Section title="Data" icon={<DataIcon size={20} />}>
        <p className="text-base text-muted">
          Removes your library, flashcards, queue and settings from this device. Export a backup first if you want to keep them.
        </p>
        <Button variant="danger" onClick={() => setConfirm(true)}>Clear all data</Button>
      </Section>

      <Section title="About" icon={<InfoIcon size={20} />}>
        <p className="text-base text-muted">Solver-NQ keeps everything on this device. Your key is sent only to your AI provider.</p>
        <p className="mt-3 text-base font-semibold text-ink">Built by Mohammed Abdul Nayeem</p>
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
    </>
  );
}
