import type { ExportItem } from './markdown';

const q = (s: string) => JSON.stringify(s); // a JSON string is also a valid double-quoted YAML string
const day = (ts: number) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

/** Obsidian tags: no spaces, no leading #. */
export const tagSlug = (t: string) => t.trim().replace(/^#+/, '').replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_\-/]/gu, '');

/** YAML block Obsidian reads as properties: title, subject, tags, date, source. */
export function frontMatter(items: ExportItem[], title: string): string {
  const subjects = [...new Set(items.map((i) => i.q.subject))];
  const tags = [...new Set([...subjects, ...items.flatMap((i) => i.q.tags)].map(tagSlug).filter(Boolean))];
  const when = items.length ? Math.max(...items.map((i) => i.q.createdAt)) : Date.now();
  const lines = ['---', `title: ${q(title)}`];
  lines.push(subjects.length === 1 ? `subject: ${q(subjects[0])}` : `subject: [${subjects.map(q).join(', ')}]`);
  lines.push(tags.length ? `tags: [${tags.map(q).join(', ')}]` : 'tags: []');
  lines.push(`date: ${day(when)}`, 'source: Solver-NQ', `answers: ${items.length}`, '---', '');
  return lines.join('\n');
}
