// verify(): offline cross-check of an AI answer. Only ever says "match" when we really checked it.
import type { Answer } from '@/types';
import type { Verdict } from './mathEnv';

export type { Verdict };

export async function verify(questionText: string, answer: Answer): Promise<Verdict> {
  const final = answer.finalAnswer ?? '';
  if (!questionText.trim() || !final.trim()) return 'unchecked';
  try {
    // Lazy: keeps mathjs (~640 kB) out of the startup bundle.
    const [{ checkCalculus }, { checkEquation }, { checkArithmetic }] = await Promise.all([
      import('./calculus'), import('./equation'), import('./arithmetic'),
    ]);
    for (const check of [checkCalculus, checkEquation, checkArithmetic]) {
      const verdict = check(questionText, final);
      if (verdict) return verdict;
    }
  } catch {
    // Any unexpected failure means we could not check it - never guess.
  }
  return 'unchecked';
}
