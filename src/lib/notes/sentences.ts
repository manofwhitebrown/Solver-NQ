/** Split into sentences, keeping $math$ intact and not breaking on "e.g." / "Fig. 3" / decimals. */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const para of text.replace(/\r\n?/g, '\n').split(/\n{2,}/)) {
    const flat = para.replace(/\s*\n\s*/g, ' ').trim();
    if (!flat) continue;
    const parts = flat.split(/(?<=[.!?])\s+(?=[A-Z0-9"($[])/);
    let buf = '';
    for (const p of parts) {
      buf = buf ? `${buf} ${p}` : p;
      if (/\b(e\.g|i\.e|etc|vs|Fig|Eq|No|Dr|Mr|Mrs|approx)\.$/i.test(buf)) continue;
      out.push(buf.trim());
      buf = '';
    }
    if (buf) out.push(buf.trim());
  }
  return out.filter((s) => s.length > 1);
}

export const words = (s: string): string[] => s.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) ?? [];
