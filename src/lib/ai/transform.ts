import { AiError } from './errors';
import { runModel } from './run';

export type TransformKind = 'summary' | 'cheatsheet' | 'keyterms' | 'qa-from-text';
export interface TransformOpts { language?: string; maxItems?: number }

const PROMPTS: Record<TransformKind, string> = {
  summary: 'Summarise the text for a student. Short paragraphs and a few bullet points. Keep every important fact.',
  cheatsheet: 'Turn the text into a one-page cheat sheet: headings, key formulas or facts, and short examples.',
  keyterms: 'List the key terms from the text as a Markdown list: **term**: one-sentence definition.',
  'qa-from-text': 'Write study questions with answers from the text. Use "**Q:** ..." then "**A:** ..." for each.',
};

/** Rewrites text as Markdown through the same fallback chain as questions. */
export async function transformText(kind: TransformKind, text: string, opts: TransformOpts = {}, signal?: AbortSignal): Promise<string> {
  const body = text.trim();
  if (!body) throw new AiError('bad_request');
  const extra = [
    opts.language ? `Write in ${opts.language}.` : '',
    opts.maxItems ? `Use at most ${opts.maxItems} items.` : '',
    'Answer with Markdown only. No preamble.',
  ].filter(Boolean).join(' ');
  const { text: out } = await runModel(`${PROMPTS[kind]} ${extra}`, [{ role: 'user', content: body }], { signal, light: kind !== 'qa-from-text' });
  const md = out.trim();
  if (!md) throw new AiError('unknown');
  return md;
}

/** Reads the text in a photo (handwriting, formulas). Only vision-capable models are used. Formulas come back as LaTeX in $...$. */
export async function transcribeImage(imageDataUrl: string, signal?: AbortSignal): Promise<string> {
  if (!imageDataUrl.startsWith('data:image/')) throw new AiError('bad_request');
  const system = 'Transcribe all text in the image exactly as written, including handwriting. Write formulas in LaTeX between $ signs. Output only the transcription, nothing else.';
  const { text } = await runModel(system, [{ role: 'user', content: 'Transcribe this image.' }], { imageDataUrl, signal, requireImage: true });
  if (!text.trim()) throw new AiError('unknown');
  return text.trim();
}
