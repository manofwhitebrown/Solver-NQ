import { describe, expect, it } from 'vitest';
import { mathToPlain } from './plainText';

describe('mathToPlain', () => {
  it.each([
    ['$x = 2$', 'x = 2'],
    ['$$x = 2$$', 'x = 2'],
    ['\\text{m}', 'm'],
    ['5 \\text{ m/s}', '5 m/s'],
    ['\\frac{a}{b}', 'a/b'],
    ['\\frac{x+1}{2}', '(x+1)/2'],
    ['\\dfrac{1}{2}', '1/2'],
    ['x^2', 'x²'],
    ['x^{10}', 'x¹⁰'],
    ['x^{-1}', 'x⁻¹'],
    ['x^{a+b}', 'x^(a+b)'],
    ['\\sqrt{x}', '√x'],
    ['\\sqrt{x+1}', '√(x+1)'],
    ['2 \\times 3 \\cdot 4', '2 × 3 · 4'],
    ['a \\leq b', 'a ≤ b'],
    ['\\pm 2', '± 2'],
    ['\\pi r^2', 'π r²'],
    ['x_1 + x_{12}', 'x_1 + x_(12)'],
    ['\\frac{\\sqrt{3}}{2}', '√3/2'],
    ['\\sin(x)', 'sin(x)'],
    ['50\\%', '50%'],
    ['', ''],
    ['plain text stays', 'plain text stays'],
  ])('%s -> %s', (input, expected) => {
    expect(mathToPlain(input)).toBe(expected);
  });

  it('never throws on broken input', () => {
    for (const bad of ['\\frac{a', '\\sqrt{', 'x^', '{{{', '\\', '$$$']) {
      expect(() => mathToPlain(bad)).not.toThrow();
    }
  });

  it('handles non-string input safely', () => {
    expect(mathToPlain(undefined as unknown as string)).toBe('');
  });
});
