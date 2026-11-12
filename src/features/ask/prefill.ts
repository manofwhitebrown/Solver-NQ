import type { Subject } from '@/types';

const SUBJECTS: readonly Subject[] = ['math', 'physics', 'chemistry', 'biology', 'coding', 'languages', 'history', 'commerce', 'other'];
const MAX_LEN = 4000;

/** Read `?text=...&subject=...` (e.g. from a "Solve it" link). Only fills the box; never sends. */
export function readPrefill(params: URLSearchParams): { text: string; subject?: Subject } | null {
  const text = params.get('text')?.trim().slice(0, MAX_LEN);
  if (!text) return null;
  const s = params.get('subject');
  const subject = SUBJECTS.find((x) => x === s);
  return { text, subject };
}
