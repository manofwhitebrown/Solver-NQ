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

const ESC: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '"': '"', '\\': '\\', '/': '/' };

/** Read one JSON string starting at the opening quote. A string still being written is returned as far as it goes. */
function readJsonString(s: string, open: number): { value: string; end: number } {
  let out = '';
  for (let i = open + 1; i < s.length; i++) {
    const c = s[i];
    if (c === '"') return { value: out, end: i + 1 };
    if (c !== '\\') { out += c; continue; }
    const n = s[i + 1];
    if (n === undefined) break; // lone backslash at the end of what we have so far
    if (n === 'u') {
      const hex = s.slice(i + 2, i + 6);
      if (hex.length < 4) break;
      out += String.fromCharCode(parseInt(hex, 16) || 63);
      i += 5;
    } else { out += ESC[n] ?? n; i++; }
  }
  return { value: out, end: s.length };
}

/**
 * Best-effort look at an answer that is still arriving (cut-off JSON from a streamed reply).
 * Returns what has been written so far, or null when it does not look like an answer yet.
 * For showing progress only: the saved answer always comes from parseAnswer() on the finished text.
 */
export function previewAnswer(raw: string): ParsedAnswer | null {
  const s = raw.replace(/^\s*```(?:json)?\s*/i, '');
  if (!/^\s*\{/.test(s)) return null;
  const re = /"(finalAnswer|summary|title|body)"\s*:\s*"/g;
  let finalAnswer = '', summary: string | undefined;
  const steps: Array<{ title: string; body: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const { value, end } = readJsonString(s, m.index + m[0].length - 1);
    if (m[1] === 'finalAnswer') finalAnswer = value;
    else if (m[1] === 'summary') summary = value;
    else if (m[1] === 'title') steps.push({ title: value, body: '' });
    else if (steps.length && !steps[steps.length - 1].body) steps[steps.length - 1].body = value;
    else steps.push({ title: '', body: value });
    re.lastIndex = end;
  }
  return finalAnswer || steps.length ? { finalAnswer, steps, summary } : null;
}
