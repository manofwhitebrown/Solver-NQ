import type { Subject } from '@/types';

export const SUBJECT_OPTIONS: Array<{ value: '' | Subject; label: string }> = [
  { value: '', label: 'All subjects' },
  { value: 'math', label: 'Math' }, { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' }, { value: 'biology', label: 'Biology' },
  { value: 'coding', label: 'Coding' }, { value: 'languages', label: 'Languages' },
  { value: 'history', label: 'History' }, { value: 'commerce', label: 'Commerce' },
  { value: 'other', label: 'Other' },
];

export const FORMATS = [
  { value: 'pdf', label: 'PDF' }, { value: 'docx', label: 'Word' },
  { value: 'md', label: 'Markdown' }, { value: 'txt', label: 'Text' }, { value: 'json', label: 'JSON' },
] as const;
