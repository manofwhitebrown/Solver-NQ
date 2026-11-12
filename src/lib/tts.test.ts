import { describe, it, expect } from 'vitest';
import { speakMath, toSpeakable, chunkText } from './tts';

describe('speakMath', () => {
  it('says squares and powers naturally', () => {
    expect(speakMath('x^2')).toBe('x squared');
    expect(speakMath('x^{3}')).toBe('x cubed');
    expect(speakMath('2^{10}')).toBe('2 to the power 10');
    expect(speakMath('x^{-1}')).toBe('x to the power minus 1');
  });
  it('reads fractions, roots and equations', () => {
    expect(speakMath('\\frac{a}{b}')).toBe('a over b');
    expect(speakMath('\\sqrt{x+1}')).toBe('square root of x plus 1');
    expect(speakMath('2x + 3 = 11')).toBe('2 x plus 3 equals 11');
  });
  it('reads symbols', () => {
    expect(speakMath('\\pi r^2')).toBe('pi r squared');
    expect(speakMath('a \\leq b')).toBe('a is at most b');
    expect(speakMath('x = -3')).toBe('x equals negative 3');
  });
});

describe('toSpeakable', () => {
  it('handles markdown and math together', () => {
    const t = toSpeakable('## Step 1\nSolve **$x^2 = 9$**.\n```js\nlet a = 1\n```');
    expect(t).toContain('Step 1');
    expect(t).toContain('x squared equals 9');
    expect(t).toContain('code block skipped');
    expect(t).not.toContain('$');
  });
});

describe('chunkText', () => {
  it('splits by sentence and caps length', () => {
    expect(chunkText('One. Two! Three?')).toEqual(['One.', 'Two!', 'Three?']);
    expect(chunkText('word '.repeat(100)).every((c) => c.length <= 220)).toBe(true);
  });
});
