import { describe, expect, it } from 'vitest';
import { verify } from './index';
import type { Answer } from '@/types';

const ans = (finalAnswer: string): Answer => ({
  id: 'a', questionId: 'q', mode: 'answer', finalAnswer, steps: [],
  verified: 'unchecked', model: 't', createdAt: 0,
});
const v = (q: string, a: string) => verify(q, ans(a));

const cases: Array<[string, string, string, 'match' | 'mismatch' | 'unchecked']> = [
  // word problems: never "match"
  ['word: train', 'A train travels 120 km in 2 hours. What is its speed?', '60 km/h', 'unchecked'],
  ['word: apples', 'Sam has 5 apples and buys 3 more. How many apples does he have?', '8', 'unchecked'],
  ['word: age', 'Ali is twice as old as Sam. Together they are 36. How old is Sam?', '12', 'unchecked'],
  ['word: price', 'A shirt costs $40 after a 20% discount. What was the original price?', '$50', 'unchecked'],
  ['word: ratio', 'Divide 60 in the ratio 2:3', '24 and 36', 'unchecked'],
  // units
  ['units: length', 'Convert 2.5 km to metres', '2500 m', 'unchecked'],
  ['units: temp', 'Convert 100 C to F', '212 F', 'unchecked'],
  ['units: speed', 'What is 36 km/h in m/s?', '10 m/s', 'unchecked'],
  ['units: mass', 'Convert 3 kg to grams', '3000 g', 'unchecked'],
  // equivalent forms
  ['forms: plus-minus', 'Solve x^2 = 4', 'x = ±2', 'match'],
  ['forms: list', 'Solve x^2 = 4', 'x = 2, x = -2', 'match'],
  ['forms: or', 'Solve x^2 = 4', 'x = 2 or x = -2', 'match'],
  ['forms: latex pm', 'Solve $x^2 = 4$', '$x = \\pm 2$', 'match'],
  ['forms: set braces (not parsed, stays unchecked)', 'Solve x^2 - 1 = 0', 'x ∈ {-1, 1}', 'unchecked'],
  ['forms: fraction vs decimal', 'Solve 2x = 1', 'x = 0.5', 'match'],
  ['forms: fraction', 'Solve 2x = 1', 'x = 1/2', 'match'],
  ['forms: latex frac', 'Solve 2x = 1', '$x = \\frac{1}{2}$', 'match'],
  ['forms: missing root', 'Solve x^2 = 4', 'x = 2', 'mismatch'],
  ['forms: wrong sign', 'Solve x + 5 = 2', 'x = 3', 'mismatch'],
  ['forms: reversed order', 'Solve x^2 - 5x + 6 = 0', 'x = 3 and x = 2', 'match'],
  // rounding tolerance
  ['round: instruction text (not parsed, stays unchecked)', 'What is 22/7 to 2 decimal places?', '3.14', 'unchecked'],
  ['round: sqrt2', 'Evaluate sqrt(2)', '1.414', 'match'],
  ['round: sqrt2 bad', 'Evaluate sqrt(2)', '1.5', 'mismatch'],
  ['round: third', 'What is 1/3?', '0.333', 'match'],
  ['round: third bad', 'What is 1/3?', '0.34', 'mismatch'],
  ['round: exact fraction', 'What is 1/3 + 1/6?', '1/2', 'match'],
  // trig degrees vs radians
  ['trig: sin 30 deg', 'What is sin(30 degrees)?', '0.5', 'match'],
  ['trig: sin 30 deg wrong', 'What is sin(30 degrees)?', '-0.988', 'mismatch'],
  ['trig: ambiguous sin 30', 'What is sin(30)?', '0.5', 'unchecked'],
  ['trig: radians', 'What is cos(pi) in radians?', '-1', 'match'],
  ['trig: tan 45 deg', 'Find tan(45°)', '1', 'match'],
  // undefined results
  ['undef: div zero', 'What is 7/0?', 'undefined', 'unchecked'],
  ['undef: div zero as number', 'What is 7/0?', '7', 'unchecked'],
  ['undef: log zero', 'What is log(0)?', 'undefined', 'unchecked'],
  ['undef: sqrt negative', 'What is sqrt(-4)?', '2', 'unchecked'],
  ['undef: no solution', 'Solve x + 1 = x + 2', 'no solution', 'unchecked'],
  // nothing checkable
  ['vague: prose', 'Why is the sky blue?', 'Rayleigh scattering', 'unchecked'],
  ['vague: proof', 'Prove that sqrt(2) is irrational', 'Assume sqrt(2) = a/b in lowest terms...', 'unchecked'],
  ['vague: empty answer', 'What is 2+2?', '', 'unchecked'],
  ['vague: words answer', 'What is 2+2?', 'four', 'unchecked'],
  ['system: two vars', 'Solve x + y = 5 and x - y = 1', 'x = 3, y = 2', 'unchecked'],
  ['inequality', 'Solve x + 1 > 3', 'x > 2', 'unchecked'],
];

describe('verify honesty', () => {
  it.each(cases)('%s', async (_name, q, a, expected) => {
    expect(await v(q, a)).toBe(expected);
  });
});
