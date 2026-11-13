import { useState } from 'react';
import { Field, Select, toast } from '@/components/ui';
import { LANGUAGES, setLanguage, useT, type LangCode } from '@/lib/i18n';

/** Drop-in language setting. AI-1 places it in Settings. Language names are written in their own script. */
export function LanguagePicker() {
  const { t, lang } = useT();
  const [busy, setBusy] = useState(false);
  async function change(code: LangCode) {
    setBusy(true);
    try { await setLanguage(code); } catch { toast('Could not load that language. Check your connection and try again.', 'error'); }
    finally { setBusy(false); }
  }
  return (
    <Field label={t('lang.label')} htmlFor="app-language" hint={t('lang.hint')}>
      <Select id="app-language" value={lang} disabled={busy} onChange={(e) => void change(e.target.value as LangCode)}
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.code === 'en' ? l.native : `${l.native} (${l.name})` }))} />
    </Field>
  );
}
