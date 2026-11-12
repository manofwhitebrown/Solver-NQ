import { BottomSheet, Chip, Cluster, Field, Select, Stack } from '@/components/ui';
import type { PlanState } from '@/lib/plan';
import type { Subject } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SUBJECTS: Subject[] = ['math', 'physics', 'chemistry', 'biology', 'coding'];
const MINUTES = [20, 30, 45, 60, 90, 120, 180].map((m) => ({ value: String(m), label: `${m} minutes` }));
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function SettingsSheet({ open, onClose, state, onChange }: {
  open: boolean; onClose: () => void; state: PlanState; onChange: (p: Partial<PlanState>) => void;
}) {
  const mins = MINUTES.some((m) => m.value === String(state.minutesPerDay)) ? MINUTES
    : [{ value: String(state.minutesPerDay), label: `${state.minutesPerDay} minutes` }, ...MINUTES];
  return (
    <BottomSheet open={open} onClose={onClose} title="Plan settings">
      <Stack gap={6}>
        <Field label="Study time per day" htmlFor="pl-min">
          <Select id="pl-min" value={String(state.minutesPerDay)} options={mins} onChange={(e) => onChange({ minutesPerDay: Number(e.target.value) })} />
        </Field>
        <Field label="Days off" htmlFor="pl-off" hint="No tasks on these days.">
          <Cluster id="pl-off" gap={2}>{DAYS.map((d, i) => (
            <Chip key={d} selected={state.offWeekdays.includes(i)} onClick={() => onChange({ offWeekdays: toggle(state.offWeekdays, i) })}>{d}</Chip>
          ))}</Cluster>
        </Field>
        <Field label="Subjects that feel harder" htmlFor="pl-weak" hint="They get more time. We also notice it from your flashcards.">
          <Cluster id="pl-weak" gap={2}>{SUBJECTS.map((s) => (
            <Chip key={s} selected={state.weakSubjects.includes(s)} onClick={() => onChange({ weakSubjects: toggle(state.weakSubjects, s) })}>
              <span className="capitalize">{s}</span></Chip>
          ))}</Cluster>
        </Field>
      </Stack>
    </BottomSheet>
  );
}
