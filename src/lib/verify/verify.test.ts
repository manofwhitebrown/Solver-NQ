import { describe, it, expect } from 'vitest';
import { verify } from './index';
import type { Answer } from '@/types';

const ans = (finalAnswer: string): Answer => ({
  id: 'a', questionId: 'q', mode: 'answer', finalAnswer, steps: [],
  verified: 'unchecked', model: 't', createdAt: 0,
});
const v = (q: string, a: string) => verify(q, ans(a));

describe('arithmetic', () => {
  it('matches correct results', async () => {
    expect(await v('What is 12*(3+4)?', '84')).toBe('match');
    expect(await v('Calculate 15% of 240', '$36$')).toBe('match');
    expect(await v('Evaluate $\\frac{3}{4} + \\frac{1}{4}$', '= 1')).toBe('match');
    expect(await v('What is 1,000 + 234?', '1,234')).toBe('match');
  });
  it('flags wrong results', async () => {
    expect(await v('What is 12*(3+4)?', '82')).toBe('mismatch');
    expect(await v('Calculate 15% of 240', '34')).toBe('mismatch');
  });
  it('accepts proper rounding only', async () => {
    expect(await v('What is 22/7?', '3.14')).toBe('match');
    expect(await v('What is 22/7?', '3.20')).toBe('mismatch');
  });
  it('never claims anything for division by zero or units', async () => {
    expect(await v('What is 5/0?', 'undefined')).toBe('unchecked');
    expect(await v('What is 5/0?', '0')).toBe('unchecked');
    expect(await v('Convert 5 km to m', '5000 m')).toBe('unchecked');
    expect(await v('What is 12*(3+4)?', 'about eighty')).toBe('unchecked');
  });
});

describe('equations', () => {
  it('matches a linear solution', async () => {
    expect(await v('Solve 2x + 3 = 11', 'x = 4')).toBe('match');
    expect(await v('Solve $2x + 3 = 11$ for $x$.', '$x = 4$')).toBe('match');
  });
  it('flags a wrong solution', async () => {
    expect(await v('Solve 2x + 3 = 11', 'x = 5')).toBe('mismatch');
  });
  it('handles multiple solutions', async () => {
    expect(await v('Solve x^2 - 5x + 6 = 0', 'x = 2 or x = 3')).toBe('match');
    expect(await v('Solve x^2 - 5x + 6 = 0', 'x = 2, 3')).toBe('match');
    expect(await v('Solve x^2 = 9', 'x = ±3')).toBe('match');
  });
  it('flags a missed root', async () => {
    expect(await v('Solve x^2 - 5x + 6 = 0', 'x = 2')).toBe('mismatch');
  });
  it('does not call a word problem complete', async () => {
    expect(await v('A square has area x^2 = 16 square cm, find its side x', 'x = 4')).toBe('unchecked');
  });
  it('catches extraneous roots from division by zero', async () => {
    expect(await v('Solve 1/(x-2) = 3', 'x = 2')).toBe('mismatch');
    expect(await v('Solve 1/(x-2) = 3', 'x = 7/3')).toBe('match');
  });
  it('catches extraneous roots of radical equations', async () => {
    expect(await v('Solve sqrt(x+2) = x', 'x = 2')).toBe('match');
    expect(await v('Solve sqrt(x+2) = x', 'x = 2 or x = -1')).toBe('mismatch');
  });
  it('accepts rounded decimals', async () => {
    expect(await v('Solve x^2 = 2', 'x ≈ ±1.414')).toBe('match');
    expect(await v('Solve x^2 = 2', 'x = ±1.5')).toBe('mismatch');
  });
  it('handles no-solution claims honestly', async () => {
    expect(await v('Solve x^2 = -4', 'No real solution')).toBe('unchecked');
    expect(await v('Solve x^2 = 4', 'No real solution')).toBe('mismatch');
  });
  it('leaves systems and inequalities unchecked', async () => {
    expect(await v('Solve x + y = 3 and x - y = 1', 'x = 2, y = 1')).toBe('unchecked');
    expect(await v('Solve x^2 < 4', 'x = 1')).toBe('unchecked');
  });
});

describe('calculus', () => {
  it('checks derivatives', async () => {
    expect(await v('Find the derivative of x^3 + 2x', "f'(x) = 3x^2 + 2")).toBe('match');
    expect(await v('Differentiate sin(x)*x', 'cos(x)*x + sin(x)')).toBe('match');
    expect(await v('Find the derivative of x^3 + 2x', '3x^2')).toBe('mismatch');
  });
  it('checks antiderivatives', async () => {
    expect(await v('Integrate x^2 dx', 'x^3/3 + C')).toBe('match');
    expect(await v('Integrate x^2 dx', 'x^3 + C')).toBe('mismatch');
    expect(await v('Find the integral of $\\cos x$', '$\\sin x + C$')).toBe('match');
  });
  it('checks definite integrals', async () => {
    expect(await v('Evaluate the integral of x^2 from 0 to 3', '9')).toBe('match');
    expect(await v('Evaluate the integral of x^2 from 0 to 3', '8')).toBe('mismatch');
    expect(await v('Evaluate $\\int_0^{\\pi} \\sin x \\, dx$', '2')).toBe('match');
  });
  it('does not check what it cannot', async () => {
    expect(await v('Find the second derivative of x^4', '12x^2')).toBe('unchecked');
    expect(await v('Integrate 1/x from 0 to 1', '1')).toBe('unchecked');
  });
});

describe('safety', () => {
  it('returns unchecked for empty or odd input', async () => {
    expect(await v('', '4')).toBe('unchecked');
    expect(await v('What is 2+2?', '')).toBe('unchecked');
    expect(await v('Why is the sky blue?', 'Rayleigh scattering')).toBe('unchecked');
    expect(await v('What is evaluate(1)?', '1')).toBe('unchecked');
  });
});
