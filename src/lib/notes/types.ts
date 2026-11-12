import type { Subject } from '@/types';

/** Matches the Note shape AI-3 stores. Kept here so this folder compiles before their type lands. */
export interface Note {
  id: string; title: string; source: 'paste' | 'file' | 'pdf' | 'image';
  text: string; summary?: string; cheatsheet?: string; keyTerms?: string[];
  subject: Subject; tags: string[]; createdAt: number; updatedAt: number;
}
export type SummaryLength = 'short' | 'medium' | 'detailed';
export interface GlossaryItem { term: string; definition: string }
