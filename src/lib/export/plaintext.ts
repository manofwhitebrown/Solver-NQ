// Turns markdown + LaTeX into readable plain text for "selectable text" PDFs and TXT.
const SYMBOLS: Record<string, string> = {
  '\\times': '×', '\\cdot': '·', '\\div': '÷', '\\pm': '±', '\\leq': '≤', '\\le': '≤',
  '\\geq': '≥', '\\ge': '≥', '\\neq': '≠', '\\approx': '≈', '\\infty': '∞', '\\pi': 'π',
  '\\theta': 'θ', '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\Delta': 'Δ',
  '\\lambda': 'λ', '\\mu': 'μ', '\\sigma': 'σ', '\\omega': 'ω', '\\Omega': 'Ω', '\\to': '→',
  '\\rightarrow': '→', '\\sum': 'Σ', '\\int': '∫', '\\sqrt': '√', '\\degree': '°', '\\circ': '°',
};

export function latexToText(tex: string): string {
  let s = tex;
  for (let i = 0; i < 4; i++) {
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  }
  s = s.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]*)\}/g, '$1');
  s = s.replace(/\^\{([^{}]*)\}/g, '^($1)').replace(/_\{([^{}]*)\}/g, '_($1)');
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
