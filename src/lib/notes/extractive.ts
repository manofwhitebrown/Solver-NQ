import { splitSentences, words } from './sentences';
import { STOP } from './stopwords';
import type { SummaryLength } from './types';

/** Word frequencies without stop words. */
function freq(text: string): Map<string, number> {
  const f = new Map<string, number>();
  for (const w of words(text)) if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) f.set(w, (f.get(w) ?? 0) + 1);
  return f;
}

export function keywords(text: string, n = 10): string[] {
  return [...freq(text)].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n).map(([w]) => w);
}

const SIZE: Record<SummaryLength, { ratio: number; min: number; max: number }> = {
  short: { ratio: 0.08, min: 2, max: 3 },
  medium: { ratio: 0.15, min: 4, max: 6 },
  detailed: { ratio: 0.25, min: 7, max: 12 },
};

/** Score sentences by keyword density, a small boost for early ones and definitions; keep original order. */
export function summarize(text: string, length: SummaryLength = 'medium'): string {
  const sents = splitSentences(text);
  const { ratio, min, max } = SIZE[length];
  const want = Math.min(sents.length, Math.max(min, Math.min(max, Math.round(sents.length * ratio))));
  if (sents.length <= want) return sents.join(' ');
  const f = freq(text);
  const top = Math.max(1, ...f.values());
  const scored = sents.map((s, i) => {
    const ws = words(s).filter((w) => f.has(w));
    let score = ws.reduce((a, w) => a + (f.get(w) ?? 0) / top, 0) / Math.sqrt(Math.max(words(s).length, 8));
    if (i < 3) score *= 1.25;
    if (/\b(is|are|means|refers to|defined as)\b/i.test(s)) score *= 1.15;
    if (s.length < 30) score *= 0.5;
    return { i, s, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, want).sort((a, b) => a.i - b.i).map((x) => x.s).join(' ');
}

/** Compact Markdown cheat sheet: key terms, then the most important sentences as bullets. */
export function cheatSheet(text: string, title = 'Cheat sheet'): string {
  const bullets = splitSentences(summarize(text, 'detailed'));
  const kw = keywords(text, 8);
  return [`# ${title}`, '', kw.length ? `## Key words\n${kw.map((k) => `- **${k}**`).join('\n')}` : '', '', '## Main points',
    ...bullets.map((s) => `- ${s}`)].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
}
