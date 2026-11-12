import type { SummaryLength } from './types';

export type TransformKind = 'summary' | 'cheatsheet' | 'keyterms' | 'qa-from-text';
type Fn = (kind: TransformKind, text: string, opts: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>;

const LENGTH_HINT: Record<SummaryLength, string> = {
  short: 'Write a SHORT summary: at most 3 sentences.',
  medium: 'Write a MEDIUM summary: about one paragraph and 4 to 6 bullet points.',
  detailed: 'Write a DETAILED summary: several paragraphs with headings and bullet points.',
};

/** AI-2's transformText, looked up at run time so this folder works before and after they push it. */
async function fn(): Promise<Fn | undefined> {
  const mod = (await import('@/lib/ai')) as unknown as { transformText?: Fn };
  return mod.transformText;
}

export const aiAvailable = async () => (typeof navigator === 'undefined' || navigator.onLine) && !!(await fn());

export async function transform(kind: TransformKind, text: string, opts: { length?: SummaryLength } = {}, signal?: AbortSignal): Promise<string> {
  const f = await fn();
  if (!f) throw new Error('ai-unavailable');
  // transformText has no length option, so the wish goes in front of the text.
  const body = kind === 'summary' && opts.length ? `${LENGTH_HINT[opts.length]}\n\nText:\n${text}` : text;
  const r = await f(kind, body, {}, signal);
  const out = typeof r === 'string' ? r : String((r as { text?: string } | null)?.text ?? '');
  if (!out.trim()) throw new Error('empty');
  return out.trim();
}

/** Split "- **Term**: definition" markdown lines back into note.keyTerms. */
export const linesOf = (md: string) => md.split('\n').map((l) => l.trim()).filter((l) => /^[-*\d]/.test(l)).map((l) => l.replace(/^[-*]\s+|^\d+[.)]\s+/, ''));
