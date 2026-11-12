// Restricted, offline mathjs instance used by all verify checks.
// "predictable" makes sqrt(-1) etc. return NaN instead of complex numbers,
// so every value we compare is a plain real number.
import { create, all, type MathNode } from 'mathjs';

const math = create(all, { predictable: true });
math.import({ ln: (x: number) => Math.log(x) }, { override: true });

const rawParse = math.parse;
// Disable the dangerous functions, as recommended by the mathjs security docs.
const blocked = () => { throw new Error('disabled'); };
math.import(
  { import: blocked, createUnit: blocked, evaluate: blocked, parse: blocked,
    simplify: blocked, derivative: blocked, reviver: blocked },
  { override: true },
);

const CONSTANTS = new Set(['pi', 'e', 'tau', 'phi']);
const MAX_LEN = 300;

/** Parse plain math text. Returns null for anything we do not trust or understand. */
export function parseExpr(text: string): MathNode | null {
  const t = text.trim();
  if (!t || t.length > MAX_LEN) return null;
  if (!/^[\w\s+\-*/^().,]*$/.test(t)) return null;      // whitelist of characters
  if (/[A-Za-z_]\s*\./.test(t) || /\.\s*[A-Za-z_]/.test(t)) return null; // no property access
  if (/\blog\b/i.test(t)) return null;                  // log is ambiguous (base 10 or e)
  if (/\b(import|createUnit|evaluate|parse|simplify|derivative|reviver)\b/.test(t)) return null;
  if (/\bi\b/.test(t)) return null;                     // imaginary unit: not supported
  try { return rawParse(t); } catch { return null; }
}

/** Names of free variables (not constants, not function names). */
export function freeSymbols(node: MathNode): Set<string> {
  const out = new Set<string>();
  node.traverse((n, path, parent) => {
    if (n.type !== 'SymbolNode') return;
    const name = (n as unknown as { name: string }).name;
    const isFn = parent?.type === 'FunctionNode' && path === 'fn';
    if (!isFn && !CONSTANTS.has(name)) out.add(name);
  });
  return out;
}

/** Compile to a function returning a real number, or NaN when undefined. */
export function toFn(node: MathNode, variable?: string): (x?: number) => number {
  const code = node.compile();
  return (x?: number) => {
    try {
      const r = code.evaluate(variable === undefined ? {} : { [variable]: x });
      return typeof r === 'number' ? r : NaN;
    } catch { return NaN; }
  };
}

/** Number of digits after the decimal point in a number written as text (0 if none). */
export function decimalsOf(text: string): number {
  const m = text.match(/\d*\.(\d+)/);
  return m ? m[1].length : 0;
}

/** Half a unit in the last written decimal place; 0 for integers and fractions. */
export function halfUnit(text: string): number {
  const d = decimalsOf(text);
  return d > 0 ? 0.5 * Math.pow(10, -d) : 0;
}

export type Verdict = 'match' | 'mismatch' | 'unchecked';
