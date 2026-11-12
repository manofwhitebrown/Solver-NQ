import type { AiConfig, Provider } from '../types';
import { anthropicProvider } from './anthropic';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';
import { proxyProvider } from './proxy';

export function getProvider(cfg: AiConfig): Provider {
  if (cfg.proxyUrl) return proxyProvider(cfg);
  if (cfg.provider === 'anthropic') return anthropicProvider(cfg);
  if (cfg.provider === 'gemini') return geminiProvider(cfg);
  return openaiProvider(cfg);
}
