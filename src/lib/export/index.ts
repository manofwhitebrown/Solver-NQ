import { listLibrary, listCards } from '@/lib/db';
import type { ExportItem } from './markdown';
import { itemsToMarkdown } from './markdown';
import { markdownToPlain } from './plaintext';
import { makeFilename } from './filename';
import { filterItems } from './pack';
import { saveFile } from './saveFile';
import { resolveOptions, type ExportConfig, type ResolvedOptions, type StudyPackFilter } from './options';

export { saveFile } from './saveFile';
export type { ExportConfig, ResolvedOptions, StudyPackFilter } from './options';
export { defaultOptions, resolveOptions } from './options';
export { makeFilename } from './filename';

export async function loadItems(ids: string[]): Promise<ExportItem[]> {
  // listLibrary returns each question with its answer; keep the order the caller asked for.
  const all = await listLibrary({});
  const byId = new Map(all.map((it) => [it.q.id, it]));
  return ids.map((id) => byId.get(id)).filter((it): it is ExportItem => !!it);
}

const titleFor = (items: ExportItem[]) =>
  items.length === 1 ? items[0].q.text.split('\n')[0] : `${items[0]?.q.subject ?? 'Answers'} study set`;

async function buildPdf(items: ExportItem[], opts: ResolvedOptions, title: string, onProgress?: (d: number, t: number) => void) {
  if (opts.pdfMode === 'pretty') return (await import('./pdfPretty')).buildPrettyPdf(items, opts, title, onProgress);
  return (await import('./pdfText')).buildTextPdf(items, opts, title, onProgress);
}

export async function exportPdf(ids: string[], config: ExportConfig = {}, onProgress?: (d: number, t: number) => void) {
  const opts = resolveOptions(config);
  const items = await loadItems(ids);
  if (!items.length) throw new Error('Nothing to export');
  const blob = await buildPdf(items, opts, titleFor(items), onProgress);
  await saveFile(blob, makeFilename(items[0].q.subject, titleFor(items), 'pdf'));
}

export async function exportMarkdown(ids: string[], config: ExportConfig = {}) {
  const opts = resolveOptions(config);
  const items = await loadItems(ids);
  if (!items.length) throw new Error('Nothing to export');
  const md = itemsToMarkdown(items, opts, titleFor(items));
  await saveFile(new Blob([md], { type: 'text/markdown' }), makeFilename(items[0].q.subject, titleFor(items), 'md'));
}

export async function exportDocx(ids: string[], config: ExportConfig = {}) {
  const opts = resolveOptions(config);
  const items = await loadItems(ids);
  if (!items.length) throw new Error('Nothing to export');
  const blob = await (await import('./docx')).buildDocx(items, opts, titleFor(items));
  await saveFile(blob, makeFilename(items[0].q.subject, titleFor(items), 'docx'));
}

export async function exportTxt(ids: string[], config: ExportConfig = {}) {
  const opts = resolveOptions(config);
  const items = await loadItems(ids);
  const text = markdownToPlain(itemsToMarkdown(items, opts, titleFor(items)));
  await saveFile(new Blob([text], { type: 'text/plain' }), makeFilename(items[0]?.q.subject ?? 'answers', titleFor(items), 'txt'));
}

export async function exportJson(ids: string[]) {
  const items = await loadItems(ids);
  await saveFile(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }),
    makeFilename(items[0]?.q.subject ?? 'answers', titleFor(items), 'json'));
}

export async function exportStudyPack(filter: StudyPackFilter, config: ExportConfig = {}, onProgress?: (d: number, t: number) => void) {
  const opts = resolveOptions(config);
  const all = await listLibrary({});
  const items = filterItems(all, filter);
  if (!items.length) throw new Error('No answers match this filter');
  const cards = opts.includeCards ? await listCards({ subject: filter.subject }) : [];
  const { buildPackPdf } = await import('./studyPack');
  const blob = await buildPackPdf(items, cards, opts, filter, onProgress);
  await saveFile(blob, makeFilename(filter.subject ?? 'Study pack', 'Study pack', 'pdf'));
}
