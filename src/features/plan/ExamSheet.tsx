import { useState } from 'react';
import { BottomSheet, Button, Field, Input, Select, Stack } from '@/components/ui';
import type { Subject } from '@/types';
import type { Exam } from '@/lib/plan';

const SUBJECTS: Subject[] = ['math', 'physics', 'chemistry', 'biology', 'coding'];
const OPTIONS = SUBJECTS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

export function ExamSheet({ open, onClose, today, onAdd }: {
  open: boolean; onClose: () => void; today: string; onAdd: (e: Exam) => void;
}) {
  const [subject, setSubject] = useState<Subject>('math');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const ok = date >= today && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const submit = () => {
    onAdd({ id: `e${Date.now().toString(36)}`, subject, name: name.trim() || `${subject} exam`, date });
    setName(''); setDate(''); onClose();
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Add an exam">
      <Stack gap={5}>
        <Field label="Subject" htmlFor="ex-sub"><Select id="ex-sub" value={subject} options={OPTIONS} onChange={(e) => setSubject(e.target.value as Subject)} /></Field>
        <Field label="Name" htmlFor="ex-name"><Input id="ex-name" value={name} placeholder="Midterm" maxLength={80} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Date" htmlFor="ex-date" hint="We plan backwards from this day."><Input id="ex-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Button block disabled={!ok} onClick={submit}>Add exam</Button>
      </Stack>
    </BottomSheet>
  );
}
