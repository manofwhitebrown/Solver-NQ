import type { Subject } from '@/types';
export type PageSize = 'a4' | 'letter';
export type PdfMode = 'pretty' | 'text';

export interface ResolvedOptions {
  pageSize: PageSize;
  pdfMode: PdfMode;
  fontSize: number; // pt, 9-16
  stepsMode: 'final' | 'full'; // final answer only vs full steps
  includeImage: boolean;
  includeDate: boolean;
  includeCards: boolean; // study pack: flashcards section
}

export const defaultOptions: ResolvedOptions = {
  pageSize: 'a4',
  pdfMode: 'pretty',
  fontSize: 11,
  stepsMode: 'full',
  includeImage: false,
  includeDate: true,
  includeCards: false,
};

export interface StudyPackFilter {
  subject?: Subject;
  tag?: string;
  from?: number; // ms timestamp
  to?: number;
  starred?: boolean;
}

import type { ExportOptions } from '@/types';

/** Contract ExportOptions (from types.ts) plus this module's extras. All optional. */
export type ExportConfig = ExportOptions & Partial<ResolvedOptions>;

export function resolveOptions(o: ExportConfig = {}): ResolvedOptions {
  const d = defaultOptions;
  return {
    pageSize: o.pageSize ?? o.paper ?? d.pageSize,
    pdfMode: o.pdfMode ?? d.pdfMode,
    fontSize: Math.min(16, Math.max(9, o.fontSize ?? d.fontSize)),
    stepsMode: o.stepsMode ?? (o.includeSteps === false ? 'final' : d.stepsMode),
    includeImage: o.includeImage ?? o.includeImages ?? d.includeImage,
    includeDate: o.includeDate ?? d.includeDate,
    includeCards: o.includeCards ?? d.includeCards,
  };
}
