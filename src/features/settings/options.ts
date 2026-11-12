import type { Provider } from '@/lib/settings';
import type { Mode, Subject } from '@/types';

export const PROVIDERS: Array<{ value: Provider; label: string }> = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI or compatible' },
  { value: 'gemini', label: 'Google Gemini' },
];

export const SUBJECTS: Array<{ value: Subject; label: string }> = [
  { value: 'math', label: 'Math' }, { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' }, { value: 'biology', label: 'Biology' },
  { value: 'coding', label: 'Coding' }, { value: 'languages', label: 'Languages' },
  { value: 'history', label: 'History' }, { value: 'commerce', label: 'Commerce' },
  { value: 'other', label: 'Other' },
];

export const MODES: Array<{ value: Mode; label: string }> = [
  { value: 'learn', label: 'Learn' }, { value: 'answer', label: 'Answer' },
];

export const OCR_LANGS = [
  { value: 'eng', label: 'English' }, { value: 'hin', label: 'Hindi' },
  { value: 'tel', label: 'Telugu' }, { value: 'tam', label: 'Tamil' },
  { value: 'spa', label: 'Spanish' }, { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' }, { value: 'ara', label: 'Arabic' },
];
