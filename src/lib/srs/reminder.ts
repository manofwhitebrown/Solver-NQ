import { Capacitor } from '@capacitor/core';

export interface ReminderPrefs { enabled: boolean; hour: number; minute: number }
export const DEFAULT_REMINDER: ReminderPrefs = { enabled: false, hour: 19, minute: 0 };

/** Small interface so the UI never touches Capacitor directly. */
export interface ReminderService {
  isSupported(): boolean;
  /** Ask permission and schedule a daily reminder. Resolves false if permission is denied. */
  enable(hour: number, minute: number): Promise<boolean>;
  disable(): Promise<void>;
}

/** Web and tests: nothing to schedule. */
export const noopReminder: ReminderService = {
  isSupported: () => false,
  enable: async () => false,
  disable: async () => {},
};

const NOTIFICATION_ID = 7001;

export const nativeReminder: ReminderService = {
  isSupported: () => Capacitor.isNativePlatform(),
  async enable(hour, minute) {
    // Loaded on demand so the web bundle never pays for it.
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return false;
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_ID,
        title: 'Time to review',
        body: 'Your flashcards are waiting. A few minutes keeps the streak going.',
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      }],
    });
    return true;
  },
  async disable() {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] });
  },
};

export const reminderService: ReminderService = Capacitor.isNativePlatform() ? nativeReminder : noopReminder;

export function parseTime(value: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const hour = Number(m[1]), minute = Number(m[2]);
  return hour < 24 && minute < 60 ? { hour, minute } : null;
}
export const formatTime = (hour: number, minute: number) => `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

const KEY = 'solvernq.srs.reminder';
export function loadReminderPrefs(): ReminderPrefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (p && typeof p.enabled === 'boolean' && Number.isInteger(p.hour) && Number.isInteger(p.minute)
      && parseTime(formatTime(p.hour, p.minute))) return p;
  } catch { /* fall through */ }
  return DEFAULT_REMINDER;
}
export function saveReminderPrefs(p: ReminderPrefs): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}
