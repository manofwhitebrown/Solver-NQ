import { useEffect, useRef, useState } from 'react';
import { Button, Card, Cluster, Section, Stack } from '@/components/ui';
import { db, exportBackup, importBackup, kvGet, kvSet, requestPersistence, storageUsage } from '@/lib/db';
import { saveFile } from '@/lib/export';
import { GistCard } from './GistCard';
import { LAST_BACKUP_KEY, backupReminder, lastBackupText, usageText } from './health';

export function BackupPanel() {
  const [usage, setUsage] = useState<{ used: number; quota: number }>();
  const [persisted, setPersisted] = useState<boolean>();
  const [lastAt, setLastAt] = useState<number>();
  const [hasData, setHasData] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const refresh = () => {
    void storageUsage().then(setUsage);
    void kvGet<number>(LAST_BACKUP_KEY).then(setLastAt);
    void Promise.all([db.questions.count(), db.notes.count()]).then(([q, n]) => setHasData(q + n > 0));
  };
  useEffect(() => { void requestPersistence().then(setPersisted); refresh(); }, []);

  const download = async () => {
    setBusy(true); setMessage('');
    try {
      const json = await exportBackup();
      const stamp = new Date().toISOString().slice(0, 10);
      await saveFile(new Blob([json], { type: 'application/json' }), `solver-nq-backup-${stamp}.json`);
      await kvSet(LAST_BACKUP_KEY, Date.now());
      setMessage('Backup saved.');
    } catch (e) { setMessage(`Could not create the backup: ${(e as Error).message}`); }
    setBusy(false); refresh();
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

  const reminder = backupReminder(lastAt, Date.now(), hasData);
  const pct = usage?.quota ? Math.max(1, Math.round((usage.used / usage.quota) * 100)) : 0;

  return (
    <Section>
      <Stack gap={4}>
        <Card aria-labelledby="storage-title">
          <Stack gap={3}>
            <h2 id="storage-title" className="text-lg font-bold">Storage</h2>
            {usage && <p className="text-base">{usageText(usage.used, usage.quota)}</p>}
            {usage && usage.quota > 0 && (
              <div role="progressbar" aria-label="Storage used" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-raised">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            )}
            <p className="text-sm text-ink-2">{lastBackupText(lastAt)}</p>
            {persisted === false && <p className="text-sm text-ink-2">This browser may clear data when storage runs low, so backups matter.</p>}
          </Stack>
        </Card>

        {reminder.due && <Card role="note" className="border-accent bg-accent-soft"><p className="text-base">{reminder.text}</p></Card>}

        <Card aria-labelledby="backup-title">
          <Stack gap={3}>
            <h2 id="backup-title" className="text-lg font-bold">Back up and restore</h2>
            <p className="text-sm text-ink-2">Your library lives only on this device. Restoring adds to what you have and never overwrites it.</p>
            <Cluster gap={3}>
              <Button size="lg" disabled={busy} onClick={() => void download()}>Back up now</Button>
              <Button variant="secondary" disabled={busy} onClick={() => file.current?.click()}>Restore from file</Button>
              <input ref={file} type="file" accept="application/json,.json" hidden onChange={e => void restore(e.target.files?.[0])} />
            </Cluster>
            {message && <p role="status" className="text-sm font-semibold">{message}</p>}
          </Stack>
        </Card>

        <GistCard />
      </Stack>
    </Section>
  );
}
