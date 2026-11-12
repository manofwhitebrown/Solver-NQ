import { splitSentences } from './sentences';
import type { GlossaryItem } from './types';

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Definition-style sentences: "X is/are/means/refers to ...", "X: ...", "**X** - ...". */
export function extractGlossary(text: string, max = 20): GlossaryItem[] {
  const out: GlossaryItem[] = [];
  const seen = new Set<string>();
  const add = (term: string, definition: string) => {
    const t = clean(term).replace(/^(the|a|an)\s+/i, '');
    const k = t.toLowerCase();
    if (t.length < 2 || t.length > 50 || definition.length < 12 || seen.has(k)) return;
    if (/^(this|it|that|there|which|he|she|they|we|you|these|those)\b/i.test(t)) return;
    seen.add(k);
    out.push({ term: t, definition: clean(definition) });
  };
  for (const line of text.split(/\n/)) {
    const l = line.replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+)/, '').trim();
    const m = l.match(/^\*\*(.{2,50}?)\*\*\s*[:\-–—]\s*(.{12,})$/) ?? l.match(/^([A-Z][^:.$]{1,50}?):\s+(.{12,})$/);
    if (m) add(m[1], m[2]);
  }
  for (const s of splitSentences(text)) {
    const m = s.match(/^(?:A|An|The)?\s*([A-Za-z][\w\s-]{1,40}?)\s+(?:is|are|means|refers to|is defined as)\s+(.{15,})$/);
    if (m) add(m[1], m[2]);
  }
  return out.slice(0, max);
}

export const glossaryToMarkdown = (g: GlossaryItem[]) => g.map((x) => `- **${x.term}**: ${x.definition}`).join('\n');

/** Self-test questions from the glossary, so it works offline too. */
export function localQuestions(g: GlossaryItem[], max = 8): string {
  return g.slice(0, max).map((x, i) => `${i + 1}. What is ${x.term}?`).join('\n');
}
