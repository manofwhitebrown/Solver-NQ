import { describe, it, expect } from 'vitest';
import { parseAnswer } from '../parse';

const good = '{"finalAnswer":"x=2","steps":[{"title":"Solve","body":"$x=2$"}],"summary":"ok"}';

describe('parseAnswer', () => {
  it('parses plain JSON', () => {
    const r = parseAnswer(good);
    expect(r.finalAnswer).toBe('x=2');
    expect(r.steps).toEqual([{ title: 'Solve', body: '$x=2$' }]);
    expect(r.summary).toBe('ok');
  });
  it('strips code fences', () => {
    expect(parseAnswer('```json\n' + good + '\n```').finalAnswer).toBe('x=2');
  });
  it('ignores text around the object', () => {
    expect(parseAnswer('Here you go: ' + good + ' Hope it helps!').finalAnswer).toBe('x=2');
  });
  it('repairs trailing commas', () => {
    const r = parseAnswer('{"finalAnswer":"7","steps":[{"title":"a","body":"b"},],}');
    expect(r.finalAnswer).toBe('7');
    expect(r.steps).toHaveLength(1);
  });
  it('handles braces inside strings', () => {
    const r = parseAnswer('{"finalAnswer":"{a}","steps":[{"title":"t","body":"$\\\\frac{1}{2}$"}]}');
    expect(r.finalAnswer).toBe('{a}');
    expect(r.steps[0].body).toContain('frac');
  });
  it('falls back to one raw step', () => {
    const r = parseAnswer('The answer is simply 4.');
    expect(r.steps).toEqual([{ title: 'Answer', body: 'The answer is simply 4.' }]);
  });
  it('falls back on broken JSON', () => {
    expect(parseAnswer('{"finalAnswer": ').steps).toHaveLength(1);
  });
});

import { parseJsonLoose } from '../parse';
describe('parseJsonLoose', () => {
  it('reads arrays', () => {
    expect(parseJsonLoose('```json\n[{"front":"a","back":"b"},]\n```')).toEqual([{ front: 'a', back: 'b' }]);
  });
  it('returns null for non-JSON', () => {
    expect(parseJsonLoose('no json here')).toBeNull();
  });
});
