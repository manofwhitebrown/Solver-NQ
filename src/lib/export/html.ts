// Minimal markdown + KaTeX -> HTML for the "pretty" PDF. KaTeX is lazy-loaded.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function mdToHtml(md: string): Promise<string> {
  const katex = (await import('katex')).default;
  const math = (tex: string, display: boolean) => {
    try { return katex.renderToString(tex, { displayMode: display, throwOnError: false }); }
    catch { return esc(tex); }
  };
  const parts = md.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return parts.map((p) => {
    if (p.startsWith('$$')) return `<div class="blk">${math(p.slice(2, -2), true)}</div>`;
    if (p.startsWith('$') && p.length > 1) return math(p.slice(1, -1), false);
    return esc(p).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  }).join('');
}
