export const REMIND_AFTER_DAYS = 14;
export const LAST_BACKUP_KEY = 'last-backup-at';

/** 6 MB, 1.5 GB ... (decimal-looking units people recognise). */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 10 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

export const usageText = (used: number, quota: number) =>
  quota ? `${formatBytes(used)} of ${formatBytes(quota)} used` : `${formatBytes(used)} used`;

export interface Reminder { due: boolean; text: string }

/** Gentle nudge: only when there is something to lose, after 14 days (or never backed up). */
export function backupReminder(lastAt: number | undefined, now: number, hasData: boolean): Reminder {
  if (!hasData) return { due: false, text: '' };
  if (!lastAt) return { due: true, text: 'You have not backed up yet. A backup file keeps your library safe if this device is lost or cleared.' };
  const days = Math.floor((now - lastAt) / 86_400_000);
  return days >= REMIND_AFTER_DAYS
    ? { due: true, text: `Your last backup was ${days} days ago. It only takes a moment to save a fresh one.` }
    : { due: false, text: '' };
}

export const lastBackupText = (lastAt: number | undefined) =>
  lastAt ? `Last backup: ${new Date(lastAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}` : 'No backup yet';
