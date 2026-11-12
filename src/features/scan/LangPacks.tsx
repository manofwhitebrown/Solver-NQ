import { useCallback, useEffect, useState } from 'react';
import { BottomSheet, Button, Stack, toast } from '@/components/ui';
import { OCR_LANGS } from '@/features/settings/options';
import { BUNDLED_LANG, deleteCachedPack, downloadPack, formatBytes, friendlyMessage, listCachedPacks, type LangPack } from '@/lib/ocr';

/** Sheet listing scan languages: built in, downloaded (with size) or not downloaded. */
export function LangPacks({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [packs, setPacks] = useState<LangPack[]>([]);
  const [busy, setBusy] = useState('');
  const refresh = useCallback(() => { void listCachedPacks().then(setPacks); }, []);
  useEffect(() => { if (open) refresh(); }, [open, refresh]);

  const download = async (code: string) => {
    setBusy(code);
    try { await downloadPack(code); } catch (e) { toast(friendlyMessage(e), 'error'); }
    setBusy(''); refresh();
  };
  const remove = async (code: string) => { setBusy(code); await deleteCachedPack(code); setBusy(''); refresh(); };

  return (
    <BottomSheet open={open} onClose={onClose} title="Scan languages">
      <Stack gap={3}>
        <p className="text-sm text-ink-2">Downloaded languages work offline. English comes with the app. On Android the built-in reader is tried first; these packs are for the backup reader.</p>
        <ul className="divide-y divide-line">
          {OCR_LANGS.map(l => {
            const pack = packs.find(p => p.code === l.value);
            const builtIn = l.value === BUNDLED_LANG;
            return (
              <li key={l.value} className="flex min-h-[64px] items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ink">{l.label}</p>
                  <p className="text-sm text-ink-2">
                    {builtIn ? 'Built in, works offline' : pack ? `Downloaded, ${formatBytes(pack.bytes)}, works offline` : 'Not downloaded'}
                  </p>
                </div>
                {!builtIn && (pack
                  ? <Button variant="secondary" size="sm" disabled={busy === l.value} onClick={() => void remove(l.value)}>Remove</Button>
                  : <Button variant="secondary" size="sm" loading={busy === l.value} onClick={() => void download(l.value)}>Download</Button>)}
              </li>
            );
          })}
        </ul>
        <Button variant="ghost" onClick={onClose}>Done</Button>
      </Stack>
    </BottomSheet>
  );
}
