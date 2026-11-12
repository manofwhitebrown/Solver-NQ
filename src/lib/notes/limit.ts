export const MAX_CHARS = 60_000;

export interface Capped { text: string; truncated: boolean; total: number }

/** Cut at a paragraph or sentence end near the cap so we never split a sentence in half. */
export function capText(text: string, max = MAX_CHARS): Capped {
  const t = text.replace(/\r\n?/g, '\n').trim();
  if (t.length <= max) return { text: t, truncated: false, total: t.length };
  const head = t.slice(0, max);
  const cut = Math.max(head.lastIndexOf('\n\n'), head.lastIndexOf('. '), head.lastIndexOf('\n'));
  return { text: cut > max * 0.6 ? head.slice(0, cut + 1).trim() : head, truncated: true, total: t.length };
}

export const capMessage = (c: Capped, max = MAX_CHARS) =>
  `This text has ${c.total.toLocaleString()} characters. Notes work best up to ${max.toLocaleString()}, so we can use the first part for now.`;
