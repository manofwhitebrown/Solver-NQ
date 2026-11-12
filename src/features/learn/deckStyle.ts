import type { Subject } from '@/types';

export const DECK_EMOJI: Record<Subject, string> = {
  math: '➗', physics: '⚛️', chemistry: '🧪', biology: '🧬', coding: '💻',
  languages: '🗣️', history: '🏛️', commerce: '📊', other: '📚',
};

/** Soft tint behind the deck emoji (decoration only; the subject name is always shown as text). */
export const DECK_TINT: Record<Subject, string> = {
  math: '#6366f133', physics: '#0ea5e933', chemistry: '#10b98133', biology: '#84cc1633', coding: '#64748b33',
  languages: '#f59e0b33', history: '#d9770633', commerce: '#14b8a633', other: '#a855f733',
};
