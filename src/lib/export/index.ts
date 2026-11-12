// STUB owned by AI-6.
import type { CardFilter, ExportOptions } from '@/types';

const ni = (): never => { throw new Error('not implemented'); };

/** Web: download. Android: share/save sheet. */
export async function saveFile(_blob: Blob, _filename: string): Promise<void> { return ni(); }
export async function exportPdf(_ids: string[], _opts: ExportOptions): Promise<void> { return ni(); }
export async function exportMarkdown(_ids: string[], _opts: ExportOptions): Promise<void> { return ni(); }
export async function exportDocx(_ids: string[], _opts: ExportOptions): Promise<void> { return ni(); }
export async function exportStudyPack(_filter: CardFilter, _opts: ExportOptions): Promise<void> { return ni(); }
