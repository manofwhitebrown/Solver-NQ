import type { ExportItem } from './markdown';
import type { StudyPackFilter } from './options';
import { plainTitle } from './plaintext';

export function filterItems(items: ExportItem[], f: StudyPackFilter): ExportItem[] {
  return items.filter(({ q }) =>
    (!f.subject || q.subject === f.subject) &&
    (!f.tag || q.tags.includes(f.tag)) &&
    (!f.starred || q.starred) &&
    (f.from === undefined || q.createdAt >= f.from) &&
    (f.to === undefined || q.createdAt <= f.to));
}

/** Table of contents entries; page numbers are filled in by the PDF writer. */
export function buildToc(items: ExportItem[]): Array<{ n: number; title: string; subject: string }> {
  return items.map(({ q }, i) => ({ n: i + 1, title: plainTitle(q.text), subject: q.subject }));
}
