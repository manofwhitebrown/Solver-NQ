import { getSettings } from '@/lib/settings';
import type { AiConfig } from './types';
import { AiError } from './errors';
import { importLegacy, loadState } from './fallback/store';

export const usesProxy = () => !!getSettings().proxyUrl.trim();

/** Proxy-mode config (the key lives on the server). Direct calls use the key pool in ./fallback. */
export function getAiConfig(): AiConfig {
  const s = getSettings();
  return {
    provider: s.provider, model: s.model.trim(), apiKey: s.apiKey.trim() || undefined,
    baseUrl: s.baseUrl.trim() || undefined, proxyUrl: s.proxyUrl.trim() || undefined,
  };
}

/** Throws a friendly no_key error when there is no way to call the AI. */
export function assertCanCall(): void {
  if (usesProxy()) return;
  importLegacy();
  const hasLocal = loadState().keys.some(k => k.provider !== 'openai' || k.key || k.baseUrl);
  if (!hasLocal) throw new AiError('no_key');
}
