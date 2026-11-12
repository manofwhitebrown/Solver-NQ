import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, SUGGESTED_MODELS } from './settings';

describe('settings defaults', () => {
  it('starts in learn mode with a suggested model', () => {
    expect(DEFAULT_SETTINGS.defaultMode).toBe('learn');
    expect(DEFAULT_SETTINGS.model).toBe(SUGGESTED_MODELS[DEFAULT_SETTINGS.provider]);
  });
  it('has no API key baked in', () => {
    expect(DEFAULT_SETTINGS.apiKey).toBe('');
  });
});
