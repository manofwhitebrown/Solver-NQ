/** A line that is only `$$ ... $$` becomes a real display block, so wide equations get their own scroll box. */
export function normalizeDisplayMath(md: string): string {
  return md.replace(/^[ \t]*\$\$[ \t]*([^\n$][^\n]*?)[ \t]*\$\$[ \t]*$/gm, '$$$$\n$1\n$$$$');
}
