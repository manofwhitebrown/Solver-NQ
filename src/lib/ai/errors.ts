export type AiErrorCode = 'no_key' | 'bad_key' | 'rate_limit' | 'timeout' | 'offline' | 'cors' | 'cancelled' | 'bad_request' | 'server' | 'exhausted' | 'blocked' | 'no_model' | 'unknown';

const MESSAGES: Record<AiErrorCode, string> = {
  no_key: 'Add your AI key in Settings first.',
  bad_key: 'Your AI key was rejected. Check it in Settings.',
  rate_limit: 'The AI service is busy or your limit is reached. Try again in a minute.',
  timeout: 'The AI took too long to answer. Please try again.',
  offline: "You're offline. We'll answer when you're back online.",
  cors: 'The browser blocked this request (CORS). Try the Android app, or set a Proxy URL in Settings.',
  cancelled: 'Cancelled.',
  bad_request: 'The AI could not accept this request. Check the model name in Settings.',
  server: 'The AI service had a problem. Please try again shortly.',
  exhausted: "All free limits are used up. I'll answer automatically when quota resets.",
  blocked: 'The AI declined to answer this one (safety filter). Try rewording the question.',
  no_model: 'None of your chosen models is available. Open AI settings and tap Fetch available models.',
  unknown: 'Something went wrong while asking the AI.',
};

export class AiError extends Error {
  constructor(public code: AiErrorCode, public retryAt?: number) {
    super(code === 'exhausted' && retryAt ? `All free limits are used up. I'll answer automatically when quota resets (about ${formatTime(retryAt)}).` : MESSAGES[code]);
    this.name = 'AiError';
  }
  /** Only these are worth queueing and retrying later. */
  get retryable() { return this.code === 'offline' || this.code === 'timeout' || this.code === 'exhausted'; }
}

export function errorFromStatus(status: number): AiError {
  if (status === 401 || status === 403) return new AiError('bad_key');
  if (status === 429) return new AiError('rate_limit');
  if (status === 408 || status === 504) return new AiError('timeout');
  if (status >= 500) return new AiError('server');
  if (status >= 400) return new AiError('bad_request');
  return new AiError('unknown');
}

/** fetch() itself threw. Never include the request in the message. */
export function errorFromNetwork(e: unknown, online: boolean): AiError {
  if (e instanceof AiError) return e;
  if ((e as Error)?.name === 'AbortError') return new AiError('cancelled');
  return new AiError(online ? 'cors' : 'offline');
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
