import { cheatSheet, keywords, summarize } from './extractive';
import { extractGlossary, glossaryToMarkdown } from './glossary';
import type { GlossaryItem, Note, SummaryLength } from './types';

/** Offline results, computed on the fly. They are only stored when the user keeps them. */
export interface LocalOutputs { summary: string; cheatsheet: string; glossary: GlossaryItem[]; keywords: string[] }

export function localOutputs(text: string, title: string, length: SummaryLength = 'medium'): LocalOutputs {
  return {
    summary: summarize(text, length),
    cheatsheet: cheatSheet(text, title),
    glossary: extractGlossary(text),
    keywords: keywords(text, 10),
  };
}

export const termLines = (g: GlossaryItem[]) => glossaryToMarkdown(g).split('\n').filter(Boolean);

export function titleFrom(text: string, fallback = 'Untitled note'): string {
  const first = text.trim().split(/\n/).find((l) => l.trim());
  if (!first) return fallback;
  const t = first.replace(/^#+\s*/, '').replace(/\s+/g, ' ').trim();
  return t.length > 60 ? `${t.slice(0, 57).trimEnd()}...` : t;
}

export function newNote(p: Pick<Note, 'text' | 'source' | 'subject'> & { title?: string; tags?: string[] }, now = Date.now()): Note {
  const title = p.title?.trim() || titleFrom(p.text);
  return {
    id: `n_${now.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title, source: p.source, text: p.text, subject: p.subject, tags: p.tags ?? [],
    keyTerms: undefined, createdAt: now, updatedAt: now,
  };
}
