// Turn the LaTeX / unicode that AI answers contain into plain text mathjs can parse.
const FUNCS = 'sin|cos|tan|sec|csc|cot|sinh|cosh|tanh|asin|acos|atan|exp|sqrt|ln|log10|log2|abs';

export function latexToMath(src: string): string {
  let s = src;
  s = s.replace(/\\text\{([^}]*)\}/g, ' $1 ');
  s = s.replace(/\\(left|right)/g, '').replace(/\\[,;!:]/g, ' ').replace(/\\q?quad/g, ' ');
  s = s.replace(/\$+/g, '');
  for (let i = 0; i < 5; i++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, '(($1)/($2))');
  }
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, 'sqrt($1)');
  s = s.replace(/\\?arc(sin|cos|tan)\b/g, 'a$1');
  s = s.replace(new RegExp(`\\\\(${FUNCS})\\b`, 'g'), '$1');
  s = s.replace(/\\int(?![a-z])/g, '∫').replace(/\\approx/g, '≈').replace(/\\pm/g, '±');
  s = s.replace(/\\cdot|\\times|×|·|⋅/g, '*').replace(/\\div|÷/g, '/');
  s = s.replace(/\\pi|π/g, 'pi').replace(/[−–]/g, '-');
  s = s.replace(/√\s*\(([^)]*)\)/g, 'sqrt($1)').replace(/√\s*([\w.]+)/g, 'sqrt($1)');
  s = s.replace(/_\{([^{}]*)\}/g, '_($1)').replace(/\^\{([^{}]*)\}/g, '^($1)');
  s = s.replace(/²/g, '^2').replace(/³/g, '^3');
  s = s.replace(/≈/g, '=');
  s = s.replace(/\{/g, '(').replace(/\}/g, ')');
  // "sin x" -> "sin(x)"
  s = s.replace(new RegExp(`\\b(${FUNCS})\\s+([a-z0-9.]+)`, 'gi'), '$1($2)');
  s = s.replace(/\\/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

/** Drop thousands separators: 1,234,567 -> 1234567 */
export function stripThousands(s: string): string {
  return s.replace(/(\d),(?=\d{3}(?!\d))/g, '$1');
}

export function lastSide(s: string): string {
  const parts = s.split('=');
  return parts[parts.length - 1].replace(/[.\s]+$/, '').trim();
}
