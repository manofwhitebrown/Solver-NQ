import type { ChatMessage } from './types';
import { getAiConfig, usesProxy } from './config';
import { getProvider } from './providers';
import { AiError } from './errors';
import { callWithFallback } from './fallback/callWithFallback';
import { verifyChain } from './fallback/models';
import { loadState } from './fallback/store';
import { acquire, dedupe } from './fallback/throttle';

function quickHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

let verified: Promise<unknown> | null = null;
/** One ListModels check per session (not a generateContent call, so it uses no model quota). Never blocks for long. */
function verifyOnce(): Promise<unknown> {
  if (!verified) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    verified = verifyChain(ctrl.signal).finally(() => clearTimeout(timer));
  }
  return verified;
}
export const resetVerify = () => { verified = null; }; // tests

export interface RunOpts { imageDataUrl?: string; signal?: AbortSignal; light?: boolean; requireImage?: boolean }

/** One call to the AI. Goes through the free-tier fallback chain (or the proxy if one is set). */
export async function runModel(
  system: string, messages: ChatMessage[], opts: RunOpts = {},
): Promise<{ text: string; model: string; usedFallback?: boolean }> {
  if (usesProxy()) return runViaProxy(system, messages, opts);
  const key = quickHash(system + JSON.stringify(messages)) + ':' + (opts.imageDataUrl?.length ?? 0);
  // Identical request already in flight (double tap): share its answer instead of spending quota twice.
  return dedupe(key, async () => {
    await acquire(loadState().perMinute);
    await verifyOnce();
    return callWithFallback({ system, messages, imageDataUrl: opts.imageDataUrl, signal: opts.signal }, { light: opts.light, requireImage: opts.requireImage });
  });
}

async function runViaProxy(system: string, messages: ChatMessage[], opts: RunOpts) {
  const cfg = getAiConfig();
  const provider = getProvider(cfg);
  try {
    return { text: await provider.complete({ system, messages, ...opts }), model: cfg.model };
  } catch (e) {
    if (opts.imageDataUrl && e instanceof AiError && e.code === 'bad_request') {
      return { text: await provider.complete({ system, messages, signal: opts.signal }), model: cfg.model };
    }
    throw e;
  }
}
