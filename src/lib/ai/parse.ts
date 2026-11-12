import type { ParsedAnswer } from './types';

/** First balanced {...} or [...] block, ignoring brackets inside strings. */
function extractJson(s: string): string | null {
  const start = s.search(/[{[]/);
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{' || c === '[') depth++;
    else if ((c === '}' || c === ']') && --depth === 0) return s.slice(start, i + 1);
  }
  return null;
}

/** Parse model text as JSON: strips fences and chatter, repairs trailing commas. null if hopeless. */
export function parseJsonLoose(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const block = extractJson(text);
  if (!block) return null;
  for (const candidate of [block, block.replace(/,\s*([}\]])/g, '$1')]) {
    try { return JSON.parse(candidate); } catch { /* try the repaired version */ }
  }
  return null;
}

const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

/** Turn raw model text into an answer. Never throws: falls back to one raw step. */
export function parseAnswer(raw: string): ParsedAnswer {
  const j = parseJsonLoose(raw) as Record<string, unknown> | null;
  if (j && typeof j === 'object' && !Array.isArray(j)) {
    const steps = Array.isArray(j.steps)
      ? (j.steps as Array<Record<string, unknown> | null>)
          .map((s) => ({ title: str(s?.title), body: str(s?.body) }))
          .filter((s) => s.title || s.body)
      : [];
    if (steps.length || j.finalAnswer) {
      return { finalAnswer: str(j.finalAnswer), steps, summary: j.summary ? str(j.summary) : undefined };
    }
  }
  return { finalAnswer: '', steps: [{ title: 'Answer', body: raw.trim() }] };
}
