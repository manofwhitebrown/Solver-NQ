// Finds a plottable function in a question/answer so the screen can offer "Graph this".
import { latexToMath } from '@/lib/verify/normalize';
import { compileFn } from '@/features/graph/plot';

const CANDIDATES = [
  /(?:^|[\s,;:(])(?:f\(x\)|y)\s*=\s*([^,;=\n]+?)(?=\s*(?:[,;]|$|\sand\s|\sfor\s|\swhere\s))/i,
  /\b(?:graph|plot|sketch)\s+(?:the\s+)?(?:function\s+)?(?:(?:f\(x\)|y)\s*=\s*)?([^,;=\n]+?)\s*[.?]?$/i,
];

/** First text in `sources` that reads as a function of x, or null. */
export function findGraphable(...sources: string[]): string | null {
  for (const src of sources) {
    const s = latexToMath(src).replace(/\$/g, '');
    for (const re of CANDIDATES) {
      const m = s.match(re);
      const body = m?.[1]?.trim().replace(/[.\s]+$/, '');
      if (body && /x/i.test(body) && 'fn' in compileFn(body)) return body;
    }
  }
  return null;
}
