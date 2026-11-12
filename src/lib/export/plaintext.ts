// Turns markdown + LaTeX into readable plain text for "selectable text" PDFs and TXT.
const SYMBOLS: Record<string, string> = {
  '\\times': '×', '\\cdot': '·', '\\div': '÷', '\\pm': '±', '\\leq': '≤', '\\le': '≤',
  '\\geq': '≥', '\\ge': '≥', '\\neq': '≠', '\\approx': '≈', '\\infty': '∞', '\\pi': 'π',
  '\\theta': 'θ', '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\Delta': 'Δ',
  '\\lambda': 'λ', '\\mu': 'μ', '\\sigma': 'σ', '\\omega': 'ω', '\\Omega': 'Ω', '\\to': '→',
  '\\rightarrow': '→', '\\sum': 'Σ', '\\int': '∫', '\\sqrt': '√', '\\degree': '°', '\\circ': '°',
  '\\Rightarrow': '⇒', '\\implies': '⇒', '\\Leftrightarrow': '⇔', '\\iff': '⇔',
  '\\quad': ' ', '\\qquad': ' ', '\\left': '', '\\right': '', '\\ldots': '...', '\\cdots': '...', '\\dots': '...',
};

export function latexToText(tex: string): string {
  let s = tex;
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  }
  s = s.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]*)\}/g, '$1');
  s = s.replace(/\^\{([^{}]*)\}/g, '^($1)').replace(/_\{([^{}]*)\}/g, '_($1)');
  s = s.replace(/\\[,;:! ]/g, ' ');
  s = s.replace(/\\[a-zA-Z]+/g, (m) => SYMBOLS[m] ?? m.slice(1));
  return s.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

export function markdownToPlain(md: string): string {
  return md
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => `\n${latexToText(t)}\n`)
    .replace(/\$([^$\n]+?)\$/g, (_, t) => latexToText(t))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

/** First line of a question as a clean one-line title (math turned into readable text). */
export function plainTitle(text: string, max = 70): string {
  const line = markdownToPlain(text.split('\n')[0]).replace(/\s+/g, ' ').trim();
  return line.length > max ? line.slice(0, max - 1).trim() + '…' : line || 'Question';
}

const ASCII: Record<string, string> = {
  '∫': 'integral ', 'Σ': 'sum ', '√': 'sqrt', 'π': 'pi', 'θ': 'theta', 'α': 'alpha', 'β': 'beta',
  'γ': 'gamma', 'δ': 'delta', 'Δ': 'Delta', 'λ': 'lambda', 'μ': 'mu', 'σ': 'sigma', 'ω': 'omega',
  'Ω': 'Omega', '≤': '<=', '≥': '>=', '≠': '!=', '≈': '~', '∞': 'infinity', '→': '->', '⇒': '=>',
  '⇔': '<=>', '−': '-', '–': '-', '—': '-', '“': '"', '”': '"', '‘': "'", '’': "'", '…': '...', '·': '·',
};

/** jsPDF's built-in font only has Latin-1; map other symbols to ASCII so nothing prints as junk. */
export function pdfSafe(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    out += code <= 255 ? ch : (ASCII[ch] ?? '?');
  }
  return out;
}
