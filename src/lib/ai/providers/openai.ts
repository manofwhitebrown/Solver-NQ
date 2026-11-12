import type { AiConfig, Provider } from '../types';
import { postJson } from '../http';

/** Works with OpenAI, OpenRouter, Groq, Ollama... anything with /chat/completions. */
export function openaiProvider(cfg: AiConfig): Provider {
  const base = (cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  return {
    async complete({ system, messages, imageDataUrl, signal }) {
      const msgs = messages.map((m, i) =>
        i === 0 && imageDataUrl && m.role === 'user'
          ? { role: m.role, content: [
              { type: 'text', text: m.content },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ] }
          : m);
      const headers: Record<string, string> = cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {};
      const json = (await postJson(`${base}/chat/completions`, headers,
        { model: cfg.model, messages: [{ role: 'system', content: system }, ...msgs] }, signal)) as { choices?: Array<{ message?: { content?: string } }> };
      return json.choices?.[0]?.message?.content ?? '';
    },
  };
}
