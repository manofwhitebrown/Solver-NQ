import type { ChatMessage } from './types';
import { getAiConfig } from './config';
import { getProvider } from './providers';
import { AiError } from './errors';

/** One call to the configured provider. Returns raw model text and the model name used. */
export async function runModel(
  system: string, messages: ChatMessage[], opts: { imageDataUrl?: string; signal?: AbortSignal } = {},
): Promise<{ text: string; model: string }> {
  const cfg = getAiConfig();
  const provider = getProvider(cfg);
  try {
    return { text: await provider.complete({ system, messages, ...opts }), model: cfg.model };
  } catch (e) {
    // Some models reject images; retry once with the OCR text only.
    if (opts.imageDataUrl && e instanceof AiError && e.code === 'bad_request') {
      return { text: await provider.complete({ system, messages, signal: opts.signal }), model: cfg.model };
    }
    throw e;
  }
}
