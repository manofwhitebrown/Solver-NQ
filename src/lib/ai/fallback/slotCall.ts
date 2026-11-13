import { AiError } from '../errors';
import { getProvider } from '../providers';
import { splitDataUrl } from '../http';
import type { CompletionRequest } from '../types';
import { classify } from './classify';
import type { Failure, KeyEntry } from './types';

const TIMEOUT_MS = 60_000;
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiChunk {
  candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
  promptFeedback?: { blockReason?: string };
}

/** Same checks for a whole reply and for a finished stream: blocked, empty and cut-off replies are never answers. */
function checkReply(text: string, reason: string | undefined, blocked: boolean): string {
  if (!text && (blocked || reason === 'SAFETY')) throw new SlotFailure({ kind: 'safety' });
  if (!text.trim()) throw new SlotFailure({ kind: 'incomplete', reason: 'empty' });
  if (reason && reason !== 'STOP') throw new SlotFailure({ kind: 'incomplete', reason: 'cut_off' });
  return text;
}

/** Read a server-sent-events body (`data: {json}` lines). Reports the growing text; returns the checked final text. */
export async function readGeminiStream(res: Response, onPartial: (t: string) => void): Promise<string> {
  let text = '', reason: string | undefined, blocked = false, buf = '';
  const eat = (line: string) => {
    if (!line.startsWith('data:')) return;
    let c: GeminiChunk;
    try { c = JSON.parse(line.slice(5).trim()) as GeminiChunk; } catch { return; } // keep-alive or half line: skip
    if (c.promptFeedback?.blockReason) blocked = true;
    const cand = c.candidates?.[0];
    if (cand?.finishReason) reason = cand.finishReason;
    const add = (cand?.content?.parts ?? []).map(p => p.text ?? '').join('');
    if (add) { text += add; onPartial(text); }
  };
  const drain = (final: boolean) => {
    const lines = buf.split(/\r?\n/);
    buf = final ? '' : (lines.pop() ?? '');
    for (const l of lines) eat(l);
  };
  onPartial('');
  if (res.body) {
    const reader = res.body.getReader(), dec = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      drain(false);
    }
    buf += dec.decode();
  } else {
    buf = await res.text();
  }
  drain(true);
  return checkReply(text, reason, blocked);
}

/** A failed attempt. Carries only a classification: never the key, URL or request. */
export class SlotFailure extends Error {
  constructor(public failure: Failure) { super(failure.kind); this.name = 'SlotFailure'; }
}

async function geminiCall(k: KeyEntry, model: string, req: CompletionRequest): Promise<string> {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  req.signal?.addEventListener('abort', onAbort);
  try {
    const img = req.imageDataUrl ? splitDataUrl(req.imageDataUrl) : null;
    const contents = req.messages.map((m, i) => {
      const parts: Array<Record<string, unknown>> = [{ text: m.content }];
      if (i === 0 && img && m.role === 'user') parts.push({ inlineData: { mimeType: img.mime, data: img.data } });
      return { role: m.role === 'assistant' ? 'model' : 'user', parts };
    });
    const stream = !!req.onPartial;
    const res = await fetch(`${GEMINI}/models/${encodeURIComponent(model)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': k.key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: req.system }] }, contents }),
    });
    if (!res.ok) throw new SlotFailure(classify(res.status, await res.text().catch(() => '')));
    if (stream && req.onPartial) return await readGeminiStream(res, req.onPartial);
    const json = (await res.json()) as GeminiChunk;
    const text = (json.candidates?.[0]?.content?.parts ?? []).map(p => p.text ?? '').join('');
    return checkReply(text, json.candidates?.[0]?.finishReason, !!json.promptFeedback?.blockReason);
  } catch (e) {
    if (e instanceof SlotFailure) throw e;
    if (timedOut) throw new SlotFailure({ kind: 'transient' });
    if ((e as Error)?.name === 'AbortError') throw new AiError('cancelled');
    throw new SlotFailure({ kind: 'transient' }); // network error
  } finally {
    clearTimeout(timer);
    req.signal?.removeEventListener('abort', onAbort);
  }
}

/** Other providers (OpenAI-compatible, Anthropic) already throw AiError: map it to a classification. */
async function otherCall(k: KeyEntry, model: string, req: CompletionRequest): Promise<string> {
  try {
    return await getProvider({ provider: k.provider, model, apiKey: k.key, baseUrl: k.baseUrl }).complete(req);
  } catch (e) {
    if (!(e instanceof AiError)) throw new SlotFailure({ kind: 'transient' });
    if (e.code === 'cancelled') throw e;
    if (e.code === 'bad_key') throw new SlotFailure({ kind: 'badkey' });
    if (e.code === 'rate_limit') throw new SlotFailure({ kind: 'quota' });
    if (e.code === 'bad_request') throw new SlotFailure({ kind: 'badrequest' });
    throw new SlotFailure({ kind: 'transient' });
  }
}

export const callSlot = (k: KeyEntry, model: string, req: CompletionRequest) =>
  (k.provider === 'gemini' ? geminiCall(k, model, req) : otherCall(k, model, req));
