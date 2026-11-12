import type { AiConfig, Provider } from '../types';
import { postJson, splitDataUrl } from '../http';

export function anthropicProvider(cfg: AiConfig): Provider {
  const base = (cfg.baseUrl || 'https://api.anthropic.com').replace(/\/$/, '');
  return {
    async complete({ system, messages, imageDataUrl, signal }) {
      const img = imageDataUrl ? splitDataUrl(imageDataUrl) : null;
      const msgs = messages.map((m, i) =>
        i === 0 && img && m.role === 'user'
          ? { role: m.role, content: [
              { type: 'image', source: { type: 'base64', media_type: img.mime, data: img.data } },
              { type: 'text', text: m.content },
            ] }
          : m);
      const json = await postJson(`${base}/v1/messages`, {
        'x-api-key': cfg.apiKey ?? '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      }, { model: cfg.model, max_tokens: 4096, system, messages: msgs }, signal);
      return (json.content ?? []).filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
    },
  };
}
