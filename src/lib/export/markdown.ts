import type { Question, Answer } from '@/types';
import type { ResolvedOptions } from './options';
import { dateStamp } from './filename';

export interface ExportItem { q: Question; a?: Answer }

/** One answer as Markdown. Math stays as $...$ / $$...$$ so it round-trips. */
export function itemToMarkdown(item: ExportItem, opts: ResolvedOptions, level = 2): string {
  const h = '#'.repeat(level);
  const { q, a } = item;
  const out: string[] = [];
  out.push(`${h} ${firstLine(q.text)}`);
  if (opts.includeDate) out.push(`*${q.subject} · ${dateStamp(q.createdAt)}*`);
  out.push(`**Question**\n\n${q.text}`);
  if (!a) return out.join('\n\n');
  out.push(`**Final answer**\n\n${a.finalAnswer}`);
  if (opts.stepsMode === 'full') {
    a.steps.forEach((s, i) => out.push(`${'#'.repeat(level + 1)} Step ${i + 1}: ${s.title}\n\n${s.body}`));
    if (a.summary) out.push(`**Summary**\n\n${a.summary}`);
  }
  return out.join('\n\n');
}

export function itemsToMarkdown(items: ExportItem[], opts: ResolvedOptions, title = 'Solver-NQ export'): string {
  const body = items.map((it) => itemToMarkdown(it, opts)).join('\n\n---\n\n');
  return `# ${title}\n\n${body}\n`;
}

export function firstLine(text: string): string {
  const line = text.split('\n')[0].trim();
  return line.length > 80 ? line.slice(0, 77) + '…' : line || 'Question';
}
