const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', n: 'ⁿ',
};
const SYMBOLS: Record<string, string> = {
  cdot: '·', times: '×', div: '÷', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠',
  approx: '≈', infty: '∞', pi: 'π', theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'Δ', lambda: 'λ',
  mu: 'μ', sigma: 'σ', omega: 'ω', rightarrow: '→', to: '→', leftarrow: '←', degree: '°', circ: '°',
  sum: 'Σ', int: '∫', ldots: '…', dots: '…', cdots: '…', quad: ' ', qquad: ' ', left: '', right: '',
};

/** Contents of the first balanced {...} at s[i]; returns [inner, indexAfter] or null. */
function group(s: string, i: number): [string, number] | null {
  if (s[i] !== '{') return null;
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}' && --depth === 0) return [s.slice(i + 1, j), j + 1];
  }
  return null;
}

function wrap(x: string): string {
  return /^√?[\w.²³¹⁰⁴-⁹]+$/.test(x) ? x : `(${x})`;
}

function convert(s: string): string {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      if (!m) { i++; continue; }
      const name = m[1];
      i += m[0].length;
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const a = group(s, i);
        const b = a && group(s, a[1]);
        if (a && b) { out += `${wrap(convert(a[0]))}/${wrap(convert(b[0]))}`; i = b[1]; }
      } else if (name === 'sqrt') {
        const g = group(s, i);
        if (g) { const inner = convert(g[0]); out += `√${wrap(inner)}`; i = g[1]; } else out += '√';
      } else if (['text', 'mathrm', 'mathbf', 'textbf', 'mathit', 'operatorname', 'boxed', 'overline'].includes(name)) {
        const g = group(s, i);
        if (g) { out += convert(g[0]); i = g[1]; }
      } else if (name in SYMBOLS) out += SYMBOLS[name];
      else if (name === '\\') out += ' ';
      else if (/^[a-zA-Z]+$/.test(name)) out += name; // sin, cos, log, ln ...
      else if (',;: !'.includes(name)) out += name === '!' ? '' : ' ';
      else out += name; // escaped char like \% \$ \{
    } else if (c === '^') {
      i++;
      const g = group(s, i);
      const raw = g ? g[0] : s[i] ?? '';
      const inner = convert(raw);
      const next = g ? g[1] : i + (raw ? 1 : 0);
      out += [...inner].every((ch) => ch in SUP) ? [...inner].map((ch) => SUP[ch]).join('') : `^${wrap(inner)}`;
      i = next;
    } else if (c === '_') {
      i++;
      const g = group(s, i);
      const raw = g ? g[0] : s[i] ?? '';
      const inner = convert(raw);
      out += raw.length > 1 ? `_(${inner})` : `_${inner}`;
      i = g ? g[1] : i + (raw ? 1 : 0);
    } else if (c === '{' || c === '}') i++;
    else { out += c; i++; }
  }
  return out;
}

/** Turns LaTeX-flavoured answer text into readable plain text for lists, cards and previews. Never throws. */
export function mathToPlain(text: string): string {
  try {
    if (!text) return '';
    const stripped = String(text).replace(/\$\$/g, '').replace(/\$/g, '').replace(/\\\[|\\\]|\\\(|\\\)/g, '');
    return convert(stripped).replace(/\s+/g, ' ').trim();
  } catch {
    return String(text ?? '');
  }
}
