import { describe, expect, it } from 'vitest';
import { stringsFor } from './strings';

describe('answer strings', () => {
  it('falls back to English for unknown or missing languages', () => {
    expect(stringsFor('xx-YY').retry).toBe('Retry');
    expect(stringsFor(undefined).askAgain).toBe('Ask again');
    expect(stringsFor('en-GB').goToLibrary).toBe('Go to library');
  });
});
