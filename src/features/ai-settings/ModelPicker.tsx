import { useState } from 'react';
import { Button, Checkbox, Stack, toast } from '@/components/ui';
import { addModels, fetchGeminiModels, loadState } from '@/lib/ai/fallback';
import { rankModels } from '@/lib/ai/fallback/rank';

/** Fetch what Google really offers for the user's key and let them tick which to add. */
export function ModelPicker() {
  const [found, setFound] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const fetchNow = async () => {
    const key = loadState().keys.find(k => k.provider === 'gemini');
    if (!key) { toast('Add a Gemini key first.', 'error'); return; }
    setBusy(true);
    try {
      const have = new Set(loadState().chain.map(c => c.model));
      const list = rankModels(await fetchGeminiModels(key.key)).filter(m => !have.has(m));
      setFound(list); setPicked(new Set());
      if (!list.length) toast('No new models found.', 'info');
    } catch { toast('Could not fetch the model list. Check your key and connection.', 'error'); }
    setBusy(false);
  };
  const add = () => { addModels([...picked]); setFound(f => f.filter(m => !picked.has(m))); setPicked(new Set()); };

  return (
    <Stack gap={3}>
      <Button variant="secondary" loading={busy} onClick={fetchNow}>Fetch available models</Button>
      {found.length > 0 && (
        <>
          {found.map(m => (
            <Checkbox key={m} label={m} checked={picked.has(m)}
              onChange={() => setPicked(p => { const n = new Set(p); if (n.has(m)) n.delete(m); else n.add(m); return n; })} />
          ))}
          <Button disabled={!picked.size} onClick={add}>Add {picked.size || ''} to my chain</Button>
        </>
      )}
    </Stack>
  );
}
