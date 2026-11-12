// Derivatives and integrals, checked numerically by sampling (no symbolic algebra needed).
import type { MathNode } from 'mathjs';
import { latexToMath, lastSide } from './normalize';
import { parseExpr, freeSymbols, toFn, halfUnit, type Verdict } from './mathEnv';
import { evalNumeric } from './arithmetic';

const SAMPLES = [-3.7, -2.1, -1.3, -0.6, 0.4, 0.9, 1.7, 2.3, 3.1, 4.6];
const UNSUPPORTED = /second|third|2nd|3rd|nth|partial|implicit|\bat\b|evaluate at|critical/i;

/** Five-point numeric derivative of f at x. */
export function numDeriv(f: (x: number) => number, x: number): number {
  const h = 1e-3 * (1 + Math.abs(x));
  return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h);
}

function cleanFn(t: string): string {
  return t.replace(/\bwith respect to\b.*$/i, '').replace(/[?.\s]+$/, '')
    .replace(/^(?:the\s+)?(?:function\s+)?/i, '').replace(/^(?:f\(x\)|y)\s*=\s*/i, '').trim();
}

/** Does `g` (the claimed derivative) equal the real derivative of `f` at enough sample points? */
function sameDerivative(f: (x: number) => number, g: (x: number) => number): Verdict {
  let valid = 0;
  for (const x of SAMPLES) {
    const fd = numDeriv(f, x), gv = g(x);
    if (!Number.isFinite(fd) || !Number.isFinite(gv)) continue;
    valid++;
    if (Math.abs(fd - gv) > 1e-5 * (1 + Math.abs(fd))) return 'mismatch';
  }
  return valid >= 4 ? 'match' : 'unchecked';
}

function oneVar(node: MathNode | null): string | null {
  if (!node) return null;
  const s = freeSymbols(node);
  return s.size === 1 ? [...s][0] : null;
}

function checkDerivative(s: string, finalAnswer: string): Verdict {
  const m = s.match(/(?:derivative|differentiate|differentiation|d\/dx|dy\/dx)\s*(?:of|:)?\s*(.+)$/i)!;
  if (UNSUPPORTED.test(s)) return 'unchecked';
  const fNode = parseExpr(cleanFn(m[1]));
  const v = oneVar(fNode);
  const gNode = parseExpr(lastSide(latexToMath(finalAnswer)));
  if (!fNode || !v || !gNode) return 'unchecked';
  if ([...freeSymbols(gNode)].some((n) => n !== v)) return 'unchecked';
  return sameDerivative(toFn(fNode, v), toFn(gNode, v));
}

function checkIntegral(s: string, finalAnswer: string): Verdict {
  let text = s.replace(/^.*?(?:integrate|integral of|antiderivative of|∫)\s*/i, '');
  let bounds: [string, string] | null = null;
  const sub = s.match(/∫_\(?([^()^\s]+)\)?\^\(?([^()\s]+)\)?\s*(.*)$/);
  if (sub) { bounds = [sub[1], sub[2]]; text = sub[3]; }
  const from = text.match(/^(.*?)\s+from\s+(.+?)\s+to\s+(.+?)\s*[?.]?$/i);
  if (from) { text = from[1]; bounds = [from[2], from[3]]; }
  text = cleanFn(text.replace(/\s*\bd[a-z]\b.*$/i, ''));
  const fNode = parseExpr(text);
  const v = oneVar(fNode);
  if (!fNode || !v) return 'unchecked';
  const f = toFn(fNode, v);

  if (bounds) return checkDefinite(f, bounds, finalAnswer);
  const ans = lastSide(latexToMath(finalAnswer)).replace(/\s*[+-]\s*[cC]\s*$/, '');
  const FNode = parseExpr(ans);
  if (!FNode || [...freeSymbols(FNode)].some((n) => n !== v)) return 'unchecked';
  return sameDerivative(toFn(FNode, v), f); // d/dx F(x) must equal f(x)
}

function checkDefinite(f: (x: number) => number, bounds: [string, string], finalAnswer: string): Verdict {
  const a = evalNumeric(bounds[0]), b = evalNumeric(bounds[1]);
  const text = lastSide(latexToMath(finalAnswer));
  const claimed = evalNumeric(text);
  if (a === null || b === null || claimed === null || a === b) return 'unchecked';
  const n = 2000, h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += f(a + i * h) * (i % 2 ? 4 : 2);
  const val = (sum * h) / 3;
  if (!Number.isFinite(val)) return 'unchecked'; // improper integral etc.
  const tol = Math.max(1e-6 * (1 + Math.abs(val)), halfUnit(text) * 1.05);
  return Math.abs(val - claimed) <= tol ? 'match' : 'mismatch';
}

export function checkCalculus(question: string, finalAnswer: string): Verdict | null {
  const s = latexToMath(question);
  if (/(derivative|differentiate|differentiation|d\/dx|dy\/dx)/i.test(s)) return checkDerivative(s, finalAnswer);
  if (/(integrate|integral of|antiderivative|∫)/i.test(s)) return checkIntegral(s, finalAnswer);
  return null;
}
