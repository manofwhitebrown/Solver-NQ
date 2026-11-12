/**
 * OPTIONAL Vercel serverless proxy for Solver-NQ (proxy mode).
 *
 * Why: lets people use the app without pasting their own key. The key stays
 * on the server; the browser never sees it.
 *
 * Setup (Vercel project settings -> Environment Variables):
 *   AI_API_KEY    required. Your provider key.
 *   AI_PROVIDER   optional: anthropic (default) | openai | gemini
 *   AI_BASE_URL   optional: override provider base URL
 * Then in the app: Settings -> Proxy URL = https://<your-app>.vercel.app/api/ask
 *
 * Request body:  { provider?, model, system, messages: [{role, content}], imageDataUrl? }
 * Response body: { text }
 * Rate limit: simple per-IP, in memory (resets on cold start; fine for small use).
 * The key and request bodies are never logged.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, { n: number; start: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.start > WINDOW_MS) { hits.set(ip, { n: 1, start: now }); return false; }
  return ++h.n > MAX_PER_WINDOW;
}

const split = (u: string) => { const m = /^data:([^;,]+);base64,(.*)$/s.exec(u); return m ? { mime: m[1], data: m[2] } : null; };

function buildCall(p: string, key: string, base: string | undefined, b: any) {
  const img = b.imageDataUrl ? split(b.imageDataUrl) : null;
  const first = (i: number, m: any) => i === 0 && img && m.role === 'user';
  if (p === 'openai') {
    const msgs = b.messages.map((m: any, i: number) => first(i, m)
      ? { role: m.role, content: [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: b.imageDataUrl } }] } : m);
    return { url: `${base || 'https://api.openai.com/v1'}/chat/completions`, headers: { Authorization: `Bearer ${key}` },
      body: { model: b.model, messages: [{ role: 'system', content: b.system }, ...msgs] },
      pick: (j: any) => j.choices?.[0]?.message?.content ?? '' };
  }
  if (p === 'gemini') {
    const contents = b.messages.map((m: any, i: number) => ({ role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }, ...(first(i, m) ? [{ inlineData: { mimeType: img!.mime, data: img!.data } }] : [])] }));
    return { url: `${base || 'https://generativelanguage.googleapis.com/v1beta'}/models/${encodeURIComponent(b.model)}:generateContent`,
      headers: { 'x-goog-api-key': key }, body: { systemInstruction: { parts: [{ text: b.system }] }, contents },
      pick: (j: any) => (j.candidates?.[0]?.content?.parts ?? []).map((x: any) => x.text ?? '').join('') };
  }
  const msgs = b.messages.map((m: any, i: number) => first(i, m)
    ? { role: m.role, content: [{ type: 'image', source: { type: 'base64', media_type: img!.mime, data: img!.data } }, { type: 'text', text: m.content }] } : m);
  return { url: `${base || 'https://api.anthropic.com'}/v1/messages`,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: { model: b.model, max_tokens: 4096, system: b.system, messages: msgs },
    pick: (j: any) => (j.content ?? []).filter((x: any) => x.type === 'text').map((x: any) => x.text).join('') };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const key = process.env.AI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server has no AI_API_KEY' });

  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ error: 'Too many requests' });

  const b = req.body;
  if (!b || !Array.isArray(b.messages) || typeof b.system !== 'string' || !b.model) {
    return res.status(400).json({ error: 'Bad request' });
  }
  try {
    const provider = process.env.AI_PROVIDER || b.provider || 'anthropic';
    const call = buildCall(provider, key, process.env.AI_BASE_URL, b);
    const r = await fetch(call.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...call.headers }, body: JSON.stringify(call.body) });
    if (!r.ok) return res.status(r.status).json({ error: 'Upstream error' });
    return res.status(200).json({ text: call.pick(await r.json()) });
  } catch {
    return res.status(502).json({ error: 'Upstream unreachable' });
  }
}
