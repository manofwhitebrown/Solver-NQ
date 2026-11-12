import { saveFile } from '../export';
import { cheatSheet, summarize } from './extractive';
import { extractGlossary, glossaryToMarkdown } from './glossary';
import { parseTermLines } from './noteCards';
import type { Note } from '@/types';

/** One Markdown document with whatever the note has; offline results fill the gaps. */
export function noteToMarkdown(n: Note): string {
  const g = parseTermLines(n.keyTerms);
  const terms = g.length ? g : extractGlossary(n.text);
  const parts = [`# ${n.title}`, '', `_Subject: ${n.subject}${n.tags.length ? ` · Tags: ${n.tags.join(', ')}` : ''}_`, '',
    '## Summary', '', n.summary ?? summarize(n.text, 'medium'), '',
    n.cheatsheet ?? cheatSheet(n.text, 'Cheat sheet').replace(/^# .*\n+/, '## Cheat sheet\n\n').replace(/^## Key words/m, '### Key words').replace(/^## Main points/m, '### Main points')];
  if (terms.length) parts.push('', '## Key terms', '', glossaryToMarkdown(terms));
  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

const plain = (md: string) => md.replace(/^#{1,6}\s+/gm, '').replace(/\*\*|__/g, '').replace(/^_(.*)_$/gm, '$1');
export const noteToText = (n: Note) => plain(noteToMarkdown(n));

const slug = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) || 'note';

export async function exportNote(n: Note, kind: 'md' | 'txt'): Promise<void> {
  const body = kind === 'md' ? noteToMarkdown(n) : noteToText(n);
  await saveFile(new Blob([body], { type: 'text/plain;charset=utf-8' }), `${slug(n.title)}.${kind}`);
}
