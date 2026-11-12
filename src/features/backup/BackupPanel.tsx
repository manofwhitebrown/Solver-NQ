import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { exportBackup, importBackup, requestPersistence, storageUsage } from '@/lib/db';
import { saveFile } from '@/lib/export';

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

export function BackupPanel() {
  const [usage, setUsage] = useState<{ used: number; quota: number }>();
  const [persisted, setPersisted] = useState<boolean>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const refresh = () => { void storageUsage().then(setUsage); };
  useEffect(() => { void requestPersistence().then(setPersisted); refresh(); }, []);

  const download = async () => {
    setBusy(true); setMessage('');
    try {
      const json = await exportBackup();
      const stamp = new Date().toISOString().slice(0, 10);
      await saveFile(new Blob([json], { type: 'application/json' }), `solver-nq-backup-${stamp}.json`);
      setMessage('Backup saved.');
    } catch (e) { setMessage(`Could not create the backup: ${(e as Error).message}`); }
    setBusy(false);
  };

  const restore = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true); setMessage('');
    try {
      const r = await importBackup(await f.text());
      setMessage(r.error ?? `Restored. ${r.added} added, ${r.skipped} already here or skipped.`);
    } catch (e) { setMessage(`Could not read that file: ${(e as Error).message}`); }
    if (file.current) file.current.value = '';
    setBusy(false); refresh();
  };

  return (
    <section className="space-y-4" aria-labelledby="backup-title">
      <h2 id="backup-title" className="text-lg font-semibold">Backup and restore</h2>
      <p className="text-sm text-muted">Your library lives only on this device. Save a backup file now and then. Restoring adds to what you have and never overwrites it.</p>
      {usage && <p className="text-sm">Using {mb(usage.used)}{usage.quota ? ` of ${mb(usage.quota)} available` : ''}.</p>}
      {persisted === false && <p className="text-sm text-muted">This browser may clear data when storage runs low, so backups matter.</p>}
      <div className="flex flex-wrap gap-3">
        <Button disabled={busy} onClick={() => void download()}>Download backup</Button>
        <Button variant="secondary" disabled={busy} onClick={() => file.current?.click()}>Restore from file</Button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={e => void restore(e.target.files?.[0])} />
      </div>
      {message && <p role="status" className="text-sm">{message}</p>}
    </section>
  );
}
