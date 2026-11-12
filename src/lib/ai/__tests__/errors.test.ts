import { describe, it, expect } from 'vitest';
import { AiError, errorFromNetwork, errorFromStatus } from '../errors';

describe('errors', () => {
  it('maps http status to friendly codes', () => {
    expect(errorFromStatus(401).code).toBe('bad_key');
    expect(errorFromStatus(429).code).toBe('rate_limit');
    expect(errorFromStatus(503).code).toBe('server');
    expect(errorFromStatus(400).code).toBe('bad_request');
  });
  it('maps network failures', () => {
    expect(errorFromNetwork(new TypeError('x'), false).code).toBe('offline');
    expect(errorFromNetwork(new TypeError('x'), true).code).toBe('cors');
    expect(errorFromNetwork(Object.assign(new Error('a'), { name: 'AbortError' }), true).code).toBe('cancelled');
  });
  it('only offline and timeout are queued', () => {
    expect(new AiError('offline').retryable).toBe(true);
    expect(new AiError('timeout').retryable).toBe(true);
    expect(new AiError('cors').retryable).toBe(false);
    expect(new AiError('bad_key').retryable).toBe(false);
  });
  it('messages never contain request details', () => {
    expect(new AiError('bad_key').message).not.toMatch(/sk-|Bearer|x-api-key/i);
  });
});
