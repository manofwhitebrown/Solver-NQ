import type { AiConfig, Provider } from '../types';
import { postJson } from '../http';

/** Proxy mode: no key leaves the device. The server (api/ask.ts) adds its own. */
export function proxyProvider(cfg: AiConfig): Provider {
  return {
    async complete({ system, messages, imageDataUrl, signal }) {
      const json = await postJson(cfg.proxyUrl!, {}, {
        provider: cfg.provider, model: cfg.model, system, messages, imageDataUrl,
      }, signal);
      return json.text ?? '';
    },
  };
}
