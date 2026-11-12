import { describe, it, expect } from 'vitest';
import { formatTime, noopReminder, parseTime, reminderService } from './reminder';

describe('reminder', () => {
  it('is a no-op on web', async () => {
    expect(reminderService.isSupported()).toBe(false);
    expect(await noopReminder.enable(9, 0)).toBe(false);
    await expect(noopReminder.disable()).resolves.toBeUndefined();
  });
  it('parses and formats times', () => {
    expect(parseTime('07:05')).toEqual({ hour: 7, minute: 5 });
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('9:60')).toBeNull();
    expect(parseTime('nope')).toBeNull();
    expect(formatTime(7, 5)).toBe('07:05');
  });
});
