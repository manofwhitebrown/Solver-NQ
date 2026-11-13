import { describe, expect, it } from 'vitest';
import { isIncompleteAnswer } from './incomplete';

const step = (body: string, id = 's1', title = 'Answer') => ({ id, title, body });

describe('isIncompleteAnswer', () => {
  it('flags blank answers', () => {
    expect(isIncompleteAnswer({ finalAnswer: '', steps: [] })).toBe(true);
    expect(isIncompleteAnswer({ finalAnswer: '  ', steps: [step('  ', 's1', '')] })).toBe(true);
  });
  it('flags raw cut-off JSON in the final answer or the only step', () => {
    expect(isIncompleteAnswer({ finalAnswer: '{"finalAnswer":"x = 6","steps":[{"ti', steps: [] })).toBe(true);
    expect(isIncompleteAnswer({ finalAnswer: '', steps: [step('```json\n{"finalAnswer":"x')] })).toBe(true);
  });
  it('accepts normal answers, including ones that only have steps or code', () => {
    expect(isIncompleteAnswer({ finalAnswer: 'x = 6', steps: [] })).toBe(false);
    expect(isIncompleteAnswer({ finalAnswer: '', steps: [step('Subtract 5 from both sides.')] })).toBe(false);
    expect(isIncompleteAnswer({ finalAnswer: 'Use JSON.parse', steps: [step('{"name":"Ada"}')] })).toBe(false);
  });
  it('ignores follow-up steps when deciding', () => {
    expect(isIncompleteAnswer({ finalAnswer: '', steps: [step('Why?', 'fu-1')] })).toBe(true);
  });
});
