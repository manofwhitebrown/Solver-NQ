import { describe, expect, it } from 'vitest';
import { greetingFor } from './greeting';

describe('greetingFor', () => {
  it('picks the part of the day', () => {
    expect(greetingFor(5)).toBe('Good morning');
    expect(greetingFor(11)).toBe('Good morning');
    expect(greetingFor(12)).toBe('Good afternoon');
    expect(greetingFor(16)).toBe('Good afternoon');
    expect(greetingFor(17)).toBe('Good evening');
    expect(greetingFor(21)).toBe('Good evening');
  });
  it('says hello late at night and in the small hours', () => {
    expect(greetingFor(22)).toBe('Hello');
    expect(greetingFor(0)).toBe('Hello');
    expect(greetingFor(4)).toBe('Hello');
  });
});
