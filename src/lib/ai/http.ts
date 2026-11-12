import { AiError, errorFromNetwork, errorFromStatus } from './errors';

const TIMEOUT_MS = 60_000;

/** POST JSON, with timeout + caller cancel. Never logs headers or bodies. */
export async function postJson(url: string, headers: Record<string, string>, body: unknown, signal?: AbortSignal): Promise<any> {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw errorFromStatus(res.status);
    return await res.json();
  } catch (e) {
    if (timedOut) throw new AiError('timeout');
    throw errorFromNetwork(e, typeof navigator === 'undefined' ? true : navigator.onLine);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

/** "data:image/png;base64,AAAA" -> { mime, data } */
export function splitDataUrl(url: string): { mime: string; data: string } | null {
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(url);
  return m ? { mime: m[1], data: m[2] } : null;
}
