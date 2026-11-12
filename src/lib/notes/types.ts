import type { Note } from '@/types';

export type { Note };
export type SummaryLength = 'short' | 'medium' | 'detailed';
export interface GlossaryItem { term: string; definition: string }
export type NoteSource = Note['source'];
