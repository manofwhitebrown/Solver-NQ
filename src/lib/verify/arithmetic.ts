// Pure arithmetic questions: "What is 12*(3+4)?", "Calculate 15% of 240".
import { latexToMath, stripThousands, lastSide } from './normalize';
import { parseExpr, freeSymbols, toFn, halfUnit, type Verdict } from './mathEnv';

const LEAD = /^(?:please\s+)?(?:what is|what's|calculate|compute|evaluate|find|simplify|work out)\b(?:\s+the value of)?/i;

/** Evaluate a numeric-only expression; null if it is not plain arithmetic. */
export function evalNumeric(text: string): number | null {
  const node = parseExpr(text);
  if (!node || freeSymbols(node).size > 0) return null;
  const v = toFn(node)();
  return Number.isFinite(v) ? v : null;
}

export function checkArithmetic(question: string, finalAnswer: string): Verdict | null {
  let q = latexToMath(question).replace(LEAD, '').replace(/[=?.\s]+$/, '').trim();
  q = stripThousands(q);
  q = q.replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/gi, '(($1)/100*($2))');
  if (!q || q.includes('%') || q.includes('!')) return null;
  if (/[a-z]/i.test(q.replace(/\b(sqrt|sin|cos|tan|exp|ln|abs|log10|log2|pi)\b/gi, ''))) return null;
  const truth = evalNumeric(q);
  if (truth === null) return 'unchecked'; // e.g. division by zero: we never claim anything

  let a = stripThousands(latexToMath(finalAnswer));
  a = lastSide(a).replace(/\b(is|the|answer|result|equals|approximately|approx|about)\b/gi, '').trim();
  const claimed = evalNumeric(a);
  if (claimed === null) return 'unchecked'; // text, units, etc.
  const tol = Math.max(1e-9 * (1 + Math.abs(truth)), halfUnit(a) * 1.0001);
  return Math.abs(claimed - truth) <= tol ? 'match' : 'mismatch';
}
