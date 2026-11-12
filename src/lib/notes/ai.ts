import type { SummaryLength } from './types';

export type TransformKind = 'summary' | 'cheatsheet' | 'keyterms' | 'qa-from-text';
type Fn = (kind: TransformKind, text: string, opts: { length?: SummaryLength }, signal?: AbortSignal) => Promise<unknown>;

/** AI-2's transformText, looked up at run time so this folder works before and after they push it. */
async function fn(): Promise<Fn | undefined> {
  const mod = (await import('@/lib/ai')) as unknown as { transformText?: Fn };
  return mod.transformText;
}

export const aiAvailable = async () => (typeof navigator === 'undefined' || navigator.onLine) && !!(await fn());

export async function transform(kind: TransformKind, text: string, opts: { length?: SummaryLength } = {}, signal?: AbortSignal): Promise<string> {
  const f = await fn();
  if (!f) throw new Error('ai-unavailable');
  const r = await f(kind, text, opts, signal);
  const out = typeof r === 'string' ? r : String((r as { text?: string } | null)?.text ?? '');
  if (!out.trim()) throw new Error('empty');
  return out.trim();
}

/** Split "- **Term**: definition" markdown lines back into note.keyTerms. */
export const linesOf = (md: string) => md.split('\n').map((l) => l.trim()).filter((l) => /^[-*\d]/.test(l)).map((l) => l.replace(/^[-*]\s+|^\d+[.)]\s+/, ''));
