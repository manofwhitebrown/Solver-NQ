// STUB owned by AI-2. Replace bodies, keep signatures.
import type { Mode, QuizItem, Step, Subject } from '@/types';

const ni = (): never => { throw new Error('not implemented'); };

export async function askQuestion(
  _input: { text: string; subject: Subject; mode: Mode; imageDataUrl?: string },
  _signal?: AbortSignal,
): Promise<{ answerId: string } | { queued: true }> { return ni(); }
export async function followUp(_answerId: string, _text: string): Promise<Step> { return ni(); }
export async function generateCards(
  _answerId: string,
): Promise<Array<{ front: string; back: string }>> { return ni(); }
export async function generateQuiz(_questionIds: string[], _count: number): Promise<QuizItem[]> { return ni(); }
export async function similarProblem(_answerId: string): Promise<{ text: string }> { return ni(); }
export async function flushPending(): Promise<void> { return ni(); }
