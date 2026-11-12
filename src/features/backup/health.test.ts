import { describe, expect, it } from 'vitest';
import { backupReminder, formatBytes, usageText } from './health';

const DAY = 86_400_000;
describe('backup health', () => {
  it('formats sizes', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(6 * 1024 * 1024)).toBe('6 MB');
    expect(formatBytes(1.5 * 1024 ** 3)).toBe('1.5 GB');
    expect(usageText(6 * 1024 ** 2, 10 * 1024 ** 3)).toBe('6 MB of 10 GB used');
    expect(usageText(2048, 0)).toBe('2 KB used');
  });
  it('reminds after 14 days or when never backed up, only if there is data', () => {
    const now = 100 * DAY;
    expect(backupReminder(undefined, now, false).due).toBe(false);
    expect(backupReminder(undefined, now, true).due).toBe(true);
    expect(backupReminder(now - 13 * DAY, now, true).due).toBe(false);
    expect(backupReminder(now - 14 * DAY, now, true).text).toContain('14 days');
  });
});
