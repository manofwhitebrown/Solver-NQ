import { getSettings } from '@/lib/settings';
import type { AiConfig } from './types';
import { AiError } from './errors';

/** Read the current AI config from Settings. Throws a friendly error if no way to call the AI. */
export function getAiConfig(): AiConfig {
  const s = getSettings();
  const cfg: AiConfig = {
    provider: s.provider, model: s.model.trim(), apiKey: s.apiKey.trim() || undefined,
    baseUrl: s.baseUrl.trim() || undefined, proxyUrl: s.proxyUrl.trim() || undefined,
  };
  // A local OpenAI-compatible server (Ollama etc.) may need no key, so a custom base URL is allowed.
  const canCall = cfg.proxyUrl || cfg.apiKey || (cfg.provider === 'openai' && cfg.baseUrl);
  if (!canCall) throw new AiError('no_key');
  return cfg;
}
