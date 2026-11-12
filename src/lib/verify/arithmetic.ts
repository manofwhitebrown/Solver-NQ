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

/**
 * Trig needs a stated angle unit. Degrees are converted, radians are kept, and a bare sin(30) is ambiguous,
 * so it returns false and the caller says "unchecked" rather than guess.
 */
function resolveTrigUnits(q: string): string | false {
  if (!/\b(sin|cos|tan)\s*\(/i.test(q)) return q;
  const deg = /°|\bdegrees?\b|\bdeg\b/i.test(q);
  const rad = /\bradians?\b|\brad\b/i.test(q);
  if (deg && rad) return false;
  if (deg) {
    const wrapped = q.replace(/\b(sin|cos|tan)\s*\(([^()]*?)\s*(?:°|degrees?|deg)?\s*\)/gi, '$1(($2)*pi/180)');
    return wrapped.replace(/\s*\b(?:in|using)?\s*(?:degrees?|deg)\b|°/gi, '').trim();
  }
  if (rad) return q.replace(/\s*\b(?:in\s+)?radians?\b|\s*\brad\b/gi, '').trim();
  const args = [...q.matchAll(/\b(?:sin|cos|tan)\s*\(([^()]*)\)/gi)].map((m) => m[1]);
  return args.every((a) => /\bpi\b/i.test(a)) ? q : false;
}

export function checkArithmetic(question: string, finalAnswer: string): Verdict | null {
  let q = latexToMath(question).replace(LEAD, '').replace(/[=?.\s]+$/, '').trim();
  q = stripThousands(q);
  q = q.replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/gi, '(($1)/100*($2))');
  if (!q || q.includes('%') || q.includes('!')) return null;
  const withUnits = resolveTrigUnits(q);
  if (withUnits === false) return 'unchecked';
  q = withUnits;
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
