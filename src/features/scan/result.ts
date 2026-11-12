// Shape handed back from /scan through router state.
export interface ScanResult { text: string; imageDataUrl?: string }
export const isScanResult = (v: unknown): v is ScanResult =>
  !!v && typeof (v as ScanResult).text === 'string';
