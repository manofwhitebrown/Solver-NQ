import { useState } from 'react';
import { Card, Checkbox, Input, toast } from '@/components/ui';
import { formatTime, loadReminderPrefs, parseTime, reminderService, saveReminderPrefs, type ReminderPrefs } from '@/lib/srs';

/** Daily reminder switch. Only shown in the Android app; web has no scheduled notifications. */
export function ReminderToggle() {
  const [prefs, setPrefs] = useState<ReminderPrefs>(loadReminderPrefs);
  if (!reminderService.isSupported()) return null;

  const apply = async (next: ReminderPrefs) => {
    try {
      if (next.enabled) {
        const ok = await reminderService.enable(next.hour, next.minute);
        if (!ok) { toast('Notifications are turned off for this app in your phone settings.', 'error'); return; }
      } else await reminderService.disable();
      setPrefs(next); saveReminderPrefs(next);
    } catch { toast('Could not change the reminder. Please try again.', 'error'); }
  };

  return (
    <Card className="flex items-center justify-between gap-4 py-3">
      <Checkbox label="Daily reminder" className="flex-1" checked={prefs.enabled}
        onChange={(e) => void apply({ ...prefs, enabled: e.target.checked })} />
      <Input type="time" aria-label="Reminder time" className="w-32" disabled={!prefs.enabled}
        value={formatTime(prefs.hour, prefs.minute)}
        onChange={(e) => { const t = parseTime(e.target.value); if (t) void apply({ ...prefs, ...t }); }} />
    </Card>
  );
}
