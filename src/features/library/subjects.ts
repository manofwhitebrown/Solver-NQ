import type { Subject } from '@/types';

export const SUBJECTS: Array<{ id: Subject; label: string }> = [
  { id: 'math', label: 'Math' }, { id: 'physics', label: 'Physics' }, { id: 'chemistry', label: 'Chemistry' },
  { id: 'biology', label: 'Biology' }, { id: 'coding', label: 'Coding' }, { id: 'languages', label: 'Languages' },
  { id: 'history', label: 'History' }, { id: 'commerce', label: 'Commerce' }, { id: 'other', label: 'Other' },
];
export const subjectLabel = (s: Subject) => SUBJECTS.find(x => x.id === s)?.label ?? s;
