import type { QuizItem, Question } from '@/types';

export interface QuizConfig { subject: string; tag: string; count: number; timed: boolean }
export interface QuizSession { items: QuizItem[]; questions: Record<string, Question>; timedSeconds: number | null }
export interface Outcome { item: QuizItem; correct: boolean }
