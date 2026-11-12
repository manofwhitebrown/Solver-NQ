// STUB owned by AI-7. Grades: 0 Again, 1 Hard, 2 Good, 3 Easy (SM-2 style).
import type { Flashcard } from '@/types';

const ni = (): never => { throw new Error('not implemented'); };

export function nextReview(_card: Flashcard, _grade: 0 | 1 | 2 | 3): Flashcard { return ni(); }
export async function makeCardsFromAnswer(_answerId: string): Promise<Flashcard[]> { return ni(); }
