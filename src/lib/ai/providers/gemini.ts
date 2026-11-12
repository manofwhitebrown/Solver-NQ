import type { AiConfig, Provider } from '../types';
import { postJson, splitDataUrl } from '../http';

export function geminiProvider(cfg: AiConfig): Provider {
  const base = (cfg.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  return {
    async complete({ system, messages, imageDataUrl, signal }) {
      const img = imageDataUrl ? splitDataUrl(imageDataUrl) : null;
      const contents = messages.map((m, i) => {
        const parts: any[] = [{ text: m.content }];
        if (i === 0 && img && m.role === 'user') parts.push({ inlineData: { mimeType: img.mime, data: img.data } });
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });
      const json = await postJson(`${base}/models/${encodeURIComponent(cfg.model)}:generateContent`,
        { 'x-goog-api-key': cfg.apiKey ?? '' },
        { systemInstruction: { parts: [{ text: system }] }, contents }, signal);
      return (json.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
    },
  };
}
