import { listLibrary, listCards } from '@/lib/db';
import type { ExportItem } from './markdown';
import { itemsToMarkdown } from './markdown';
import { markdownToPlain, plainTitle } from './plaintext';
import { makeFilename } from './filename';
import { filterItems } from './pack';
import { loadImage } from './image';
import { resolveOptions, type ExportConfig, type StudyPackFilter } from './options';

export type ExportFormat = 'pdf' | 'md' | 'docx' | 'txt' | 'json' | 'pack';
export type Progress = (done: number, total: number) => void;
export interface BuildRequest {
  format: ExportFormat; ids?: string[]; filter?: StudyPackFilter;
  config?: ExportConfig; onProgress?: Progress;
  signal?: AbortSignal; onWarn?: (failed: number) => void;
}
export interface BuildResult { blob: Blob; filename: string; ms: number; count: number }

const MIME: Record<string, string> = {
  md: 'text/markdown', txt: 'text/plain', json: 'application/json',
};

export async function loadItems(ids: string[]): Promise<ExportItem[]> {
  // listLibrary returns each question with its answer; keep the order the caller asked for.
  const byId = new Map((await listLibrary({})).map((it) => [it.q.id, it]));
  return ids.map((id) => byId.get(id)).filter((it): it is ExportItem => !!it);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const titleFor = (items: ExportItem[]): string =>
  items.length === 1 ? plainTitle(items[0].q.text, 80) : `${cap(items[0]?.q.subject ?? 'Answers')} study set`;

/** Builds the file in memory. Saving/sharing is a separate step (saveFile). */
export async function buildExport(req: BuildRequest): Promise<BuildResult> {
  const t0 = performance.now();
  const opts = resolveOptions(req.config);
  const items = req.format === 'pack'
    ? filterItems(await listLibrary({}), req.filter ?? {})
    : await loadItems(req.ids ?? []);
  if (opts.includeImage && ['pdf', 'pack', 'docx'].includes(req.format)) {
    for (const it of items) if (it.q.imageBlobId) it.image = await loadImage(it.q.imageBlobId);
  }
  if (!items.length) throw new Error(req.format === 'pack' ? 'No answers match this filter' : 'Nothing to export');

  const title = req.format === 'pack' ? (req.filter?.subject ? 'Study pack' : 'All subjects') : titleFor(items);
  const subject = req.format === 'pack' ? (req.filter?.subject ?? 'Study pack') : items[0].q.subject;
  let blob: Blob;
  let ext: string = req.format;

  if (req.format === 'pdf') {
    blob = opts.pdfMode === 'pretty'
      ? await (await import('./pdfPretty')).buildPrettyPdf(items, opts, title, req.onProgress, { signal: req.signal, onWarn: req.onWarn })
      : await (await import('./pdfText')).buildTextPdf(items, opts, title, req.onProgress);
  } else if (req.format === 'pack') {
    ext = 'pdf';
    const cards = opts.includeCards ? await listCards({ subject: req.filter?.subject }) : [];
    blob = await (await import('./studyPack')).buildPackPdf(items, cards, opts, req.filter ?? {}, req.onProgress,
      { signal: req.signal, onWarn: req.onWarn });
  } else if (req.format === 'docx') {
    blob = await (await import('./docx')).buildDocx(items, opts, title);
  } else if (req.format === 'json') {
    blob = new Blob([JSON.stringify(items, null, 2)], { type: MIME.json });
  } else {
    const md = itemsToMarkdown(items, opts, title);
    blob = new Blob([req.format === 'txt' ? markdownToPlain(md) : md], { type: MIME[req.format] });
  }
  return { blob, filename: makeFilename(subject, title, ext), ms: Math.round(performance.now() - t0), count: items.length };
}
