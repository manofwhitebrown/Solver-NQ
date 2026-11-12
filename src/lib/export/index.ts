import { buildExport, type Progress } from './build';
import { saveFile } from './saveFile';
import type { ExportConfig, StudyPackFilter } from './options';

export { saveFile } from './saveFile';
export { buildExport, loadItems } from './build';
export type { ExportFormat, BuildRequest, BuildResult, Progress } from './build';
export type { ExportConfig, ResolvedOptions, StudyPackFilter } from './options';
export { defaultOptions, resolveOptions } from './options';
export { makeFilename } from './filename';

async function run(format: 'pdf' | 'md' | 'docx' | 'txt' | 'json' | 'pack', req: { ids?: string[]; filter?: StudyPackFilter; config?: ExportConfig; onProgress?: Progress }) {
  const { blob, filename } = await buildExport({ format, ...req });
  await saveFile(blob, filename);
}

// Contract functions (src/lib/export in the task file).
export const exportPdf = (ids: string[], config: ExportConfig = {}, onProgress?: Progress) => run('pdf', { ids, config, onProgress });
export const exportMarkdown = (ids: string[], config: ExportConfig = {}) => run('md', { ids, config });
export const exportDocx = (ids: string[], config: ExportConfig = {}) => run('docx', { ids, config });
export const exportTxt = (ids: string[], config: ExportConfig = {}) => run('txt', { ids, config });
export const exportJson = (ids: string[]) => run('json', { ids });
export const exportStudyPack = (filter: StudyPackFilter, config: ExportConfig = {}, onProgress?: Progress) =>
  run('pack', { filter, config, onProgress });
