import { AiError } from '../errors';
import { getProvider } from '../providers';
import { splitDataUrl } from '../http';
import type { CompletionRequest } from '../types';
import { classify } from './classify';
import type { Failure, KeyEntry } from './types';

const TIMEOUT_MS = 60_000;
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';

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
    const res = await fetch(`${GEMINI}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': k.key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: req.system }] }, contents }),
    });
    if (!res.ok) throw new SlotFailure(classify(res.status, await res.text().catch(() => '')));
    const json = (await res.json()) as {
      candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
      promptFeedback?: { blockReason?: string };
    };
    const text = (json.candidates?.[0]?.content?.parts ?? []).map(p => p.text ?? '').join('');
    if (!text && (json.promptFeedback?.blockReason || json.candidates?.[0]?.finishReason === 'SAFETY')) {
      throw new SlotFailure({ kind: 'safety' });
    }
    const reason = json.candidates?.[0]?.finishReason;
    // Empty, or stopped early (MAX_TOKENS, RECITATION, OTHER...): never save it as an answer.
    if (!text.trim() || (reason && reason !== 'STOP')) throw new SlotFailure({ kind: 'incomplete' });
    return text;
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
