// Equations in one variable: substitute the claimed solutions back in, and look for missed roots.
import { latexToMath } from './normalize';
import { parseExpr, freeSymbols, toFn, halfUnit, type Verdict } from './mathEnv';
import { evalNumeric } from './arithmetic';

const SCAN_RANGE = 1000;
const SCAN_POINTS = 20000;
const WORDS = new Set(['solve', 'find', 'for', 'the', 'value', 'values', 'of', 'equation', 'if', 'roots',
  'root', 'solutions', 'solution', 'to', 'determine', 'what', 'is', 'are', 'please', 'that', 'satisfy',
  'satisfies', 'real', 'x', 'y', 't', 'n', 'a', 'z']);
const FN_OR_CONST = /^(sin|cos|tan|sec|csc|cot|sinh|cosh|tanh|asin|acos|atan|exp|sqrt|ln|log10|log2|abs|pi|e|tau|phi)$/;

interface Parsed { lhs: string; rhs: string; pure: boolean }

function isWord(tok: string) { return /^[a-z]{2,}$/i.test(tok) && !FN_OR_CONST.test(tok); }

/** Find the single "left = right" in the question and say if the rest is just "solve ..." wording. */
export function extractEquation(question: string): Parsed | 'many' | null {
  let s = latexToMath(question);
  if (/[<>≤≥≠]/.test(s)) return null;
  if (s.includes(':')) s = s.slice(s.lastIndexOf(':') + 1);
  const toks = s.replace(/=/g, ' = ').split(/\s+/).filter(Boolean);
  const eqIdx = toks.reduce<number[]>((a, t, i) => (t === '=' ? [...a, i] : a), []);
  if (eqIdx.length === 0) return null;
  if (eqIdx.length > 1) return 'many';
  const k = eqIdx[0];
  const left: string[] = [];
  let i = k - 1;
  for (; i >= 0 && !isWord(toks[i]) && /^[\w+\-*/^().]+$/.test(toks[i]); i--) left.unshift(toks[i]);
  const right: string[] = [];
  let j = k + 1;
  for (; j < toks.length; j++) {
    const clean = toks[j].replace(/[,.;?]+$/, '');
    if (isWord(clean) || !/^[\w+\-*/^().]+$/.test(clean)) break;
    right.push(clean);
    if (clean !== toks[j]) { j++; break; }
  }
  if (!left.length || !right.length) return null;
  const outside = [...toks.slice(0, i + 1), ...toks.slice(j)]
    .map((t) => t.replace(/[,.;?]/g, '').toLowerCase()).filter(Boolean);
  return { lhs: left.join(' '), rhs: right.join(' '), pure: outside.every((w) => WORDS.has(w)) };
}

interface Claim { value: number; half: number }

function parseClaims(finalAnswer: string, v: string): Claim[] | null {
  let a = latexToMath(finalAnswer);
  const start = a.search(new RegExp(`\\b${v}\\s*=`, 'i'));
  if (start > 0) a = a.slice(start);
  const claims: Claim[] = [];
  for (const raw of a.split(/\s*(?:,|;|\bor\b|\band\b)\s*/i)) {
    const piece = raw.split('=').pop()!.replace(/[.\s]+$/, '').trim();
    if (!piece) continue;
    const variants = piece.includes('±') ? [piece.replace('±', '+'), piece.replace('±', '-')] : [piece];
    for (const vt of variants) {
      const value = evalNumeric(vt);
      if (value === null) return null;
      claims.push({ value, half: halfUnit(vt) });
    }
  }
  return claims.length ? claims : null;
}

export function findRoots(f: (x: number) => number): number[] {
  const roots: number[] = [];
  const step = (2 * SCAN_RANGE) / SCAN_POINTS;
  let px = -SCAN_RANGE, pv = f(px);
  const add = (r: number) => { if (!roots.some((q) => Math.abs(q - r) < 1e-6)) roots.push(r); };
  for (let n = 1; n <= SCAN_POINTS; n++) {
    const x = -SCAN_RANGE + n * step, v = f(x);
    if (Number.isFinite(v) && v === 0) add(x);
    else if (Number.isFinite(v) && Number.isFinite(pv) && pv * v < 0) {
      let lo = px, hi = x;
      for (let k = 0; k < 60; k++) {
        const mid = (lo + hi) / 2;
        if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
      }
      const m = (lo + hi) / 2;
      if (Math.abs(f(m)) <= 1e-6 * Math.min(Math.abs(pv), Math.abs(v)) + 1e-9) add(m);
    }
    px = x; pv = v;
  }
  return roots;
}

export function checkEquation(question: string, finalAnswer: string): Verdict | null {
  const eq = extractEquation(question);
  if (!eq) return null;
  if (eq === 'many') return 'unchecked';
  const L = parseExpr(eq.lhs), R = parseExpr(eq.rhs);
  if (!L || !R) return 'unchecked';
  const vars = new Set([...freeSymbols(L), ...freeSymbols(R)]);
  if (vars.size !== 1) return 'unchecked';
  const v = [...vars][0];
  const fl = toFn(L, v), fr = toFn(R, v);
  const f = (x: number) => fl(x) - fr(x);

  if (/\bno (real )?(solution|root)s?\b|\bnone\b/i.test(finalAnswer)) {
    return eq.pure && findRoots(f).length > 0 ? 'mismatch' : 'unchecked';
  }
  const claims = parseClaims(finalAnswer, v);
  if (!claims) return 'unchecked';

  for (const { value: c, half } of claims) {
    const r = f(c);
    if (!Number.isFinite(r)) return 'mismatch'; // undefined at the claimed value (e.g. divide by zero)
    const scale = Math.max(Math.abs(fl(c)), Math.abs(fr(c)), 1);
    const h = 1e-6 * (1 + Math.abs(c));
    const d = Math.abs((f(c + h) - f(c - h)) / (2 * h));
    const ok = Math.abs(r) <= 1e-9 * scale ||
      (half > 0 && Number.isFinite(d) && Math.abs(r) <= d * half * 1.05 + 1e-9 * scale);
    if (!ok) return 'mismatch';
  }
  if (!eq.pure) return 'unchecked'; // word problem: root may be excluded by context
  const missed = findRoots(f).some((r) =>
    !claims.some((c) => Math.abs(c.value - r) <= Math.max(c.half * 1.05, 1e-6 * (1 + Math.abs(r)))));
  return missed ? 'mismatch' : 'match';
}
