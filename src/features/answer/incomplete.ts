import type { Answer } from '@/types';

/** Raw model JSON that was never parsed into an answer (a cut-off reply saved by an older version). */
const RAW_JSON = /^\s*(```(?:json)?\s*)?\{\s*"(finalAnswer|steps|summary)"/i;

/** True when an answer has nothing readable to show, or only holds the model's raw JSON text. */
export function isIncompleteAnswer(a: Pick<Answer, 'finalAnswer' | 'steps'>): boolean {
  const steps = a.steps.filter((s) => !s.id.startsWith('fu-'));
  const hasText = a.finalAnswer.trim() !== '' || steps.some((s) => s.body.trim() !== '' || s.title.trim() !== '');
  if (!hasText) return true;
  if (RAW_JSON.test(a.finalAnswer)) return true;
  return steps.length > 0 && steps.every((s) => RAW_JSON.test(s.body));
}
