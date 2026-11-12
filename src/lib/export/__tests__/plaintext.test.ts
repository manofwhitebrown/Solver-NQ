import { describe, expect, it } from 'vitest';
import { latexToText, markdownToPlain, pdfSafe, plainTitle } from '../plaintext';

describe('plaintext helpers', () => {
  it('turns arrows and spacing commands into readable text', () => {
    expect(latexToText('x-2=0 \\Rightarrow x=2')).toBe('x-2=0 ⇒ x=2');
    expect(latexToText('a,\\quad b')).toBe('a, b');
  });
  it('makes a clean one-line title without dollar signs', () => {
    expect(plainTitle('Solve $x^2-5x+6=0$\nmore')).toBe('Solve x^2-5x+6=0');
    expect(plainTitle('')).toBe('Question');
  });
  it('maps symbols the built-in PDF font cannot draw to ASCII', () => {
    expect(pdfSafe(markdownToPlain('$\\int_0^1 x\\,dx \\le 1$'))).toBe('integral _0^1 x dx <= 1');
    expect(pdfSafe('2 × 3 ± 1')).toBe('2 × 3 ± 1'); // Latin-1 is kept
  });
});
