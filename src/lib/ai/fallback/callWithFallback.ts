import { AiError } from '../errors';
import type { CompletionRequest } from '../types';
import { cooldownUntil, nextPacificMidnight } from './classify';
import { SlotFailure, callSlot } from './slotCall';
import { activeCooldown, cooldownId, earliestRetry, importLegacy, loadState, update } from './store';
import type { KeyEntry, ModelSlot } from './types';

export interface FallbackResult { text: string; model: string; keyId: string; usedFallback: boolean }
export interface FallbackOptions { light?: boolean; requireImage?: boolean; now?: () => number; sleep?: (ms: number) => Promise<void> }

const rotation = new Map<string, number>();
const UNAVAILABLE_MS = 6 * 3_600_000;
const defaultSleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const liteFirst = (slots: ModelSlot[]) =>
  [...slots].sort((a, b) => Number(/lite/.test(b.model)) - Number(/lite/.test(a.model)));

function setCooldown(k: KeyEntry, model: string, until: number, kind: 'cooldown' | 'brief' | 'unavailable') {
  update(s => { s.cooldowns[cooldownId(k, model)] = { until, kind }; });
}

/** Keys for a slot, starting after the one used last (rotate across keys within a model). */
function keysFor(slot: ModelSlot, all: KeyEntry[]): KeyEntry[] {
  const ks = all.filter(k => k.provider === slot.provider && (!slot.keyId || k.id === slot.keyId));
  if (ks.length < 2) return ks;
  const i = (rotation.get(slot.model) ?? 0) % ks.length;
  rotation.set(slot.model, i + 1);
  return [...ks.slice(i), ...ks.slice(0, i)];
}

/** Try every enabled slot in order until one answers. Never falls through on bad keys or safety blocks. */
export async function callWithFallback(req: CompletionRequest, opts: FallbackOptions = {}): Promise<FallbackResult> {
  const now = opts.now ?? Date.now;
  const sleep = opts.sleep ?? defaultSleep;
  importLegacy();
  const state = loadState();
  if (!state.keys.length) throw new AiError('no_key');
  const enabled = state.chain.filter(c => c.enabled);
  const slots = opts.light || state.saveQuota ? liteFirst(enabled) : enabled;
  const first = enabled[0]?.model;

  let sawBadKey = false, sawUnavailable = false, sawQuota = false, sawServer = false, tried = false;
  for (const slot of slots) {
    for (const k of keysFor(slot, loadState().keys)) {
      if (loadState().invalidKeys.includes(k.id)) { sawBadKey = true; continue; }
      const cd = activeCooldown(loadState(), k, slot.model, now());
      if (cd) { if (cd.kind === 'brief') sawServer = true; continue; } // still resting after a server problem
      let attempt = 0, req2 = req;
      for (;;) {
        tried = true;
        try {
          const text = await callSlot(k, slot.model, req2);
          return { text, model: slot.model, keyId: k.id, usedFallback: slot.model !== first };
        } catch (e) {
          if (!(e instanceof SlotFailure)) throw e; // cancelled
          const f = e.failure;
          if (f.kind === 'safety') throw new AiError('blocked');
          if (f.kind === 'badrequest') {
            if (opts.requireImage) break; // this model cannot read images: try the next one
            if (req2.imageDataUrl) { req2 = { ...req2, imageDataUrl: undefined }; continue; } // model may not accept images
            throw new AiError('bad_request');
          }
          if ((f.kind === 'transient' || f.kind === 'incomplete') && attempt === 0) {
            attempt++;
            await sleep(400 + Math.random() * 600);
            continue;
          }
          if (f.kind === 'quota') { sawQuota = true; setCooldown(k, slot.model, cooldownUntil(f, now()), 'cooldown'); }
          else if (f.kind === 'transient' || f.kind === 'incomplete') { sawServer = true; setCooldown(k, slot.model, now() + 30_000, 'brief'); }
          else if (f.kind === 'unavailable') { setCooldown(k, slot.model, now() + UNAVAILABLE_MS, 'unavailable'); sawUnavailable = true; }
          else if (f.kind === 'badkey') { update(s => { if (!s.invalidKeys.includes(k.id)) s.invalidKeys.push(k.id); }); sawBadKey = true; }
          break; // next key / next slot
        }
      }
    }
  }
  if (sawBadKey && !earliestRetry(now())) throw new AiError('bad_key');
  const retryAt = earliestRetry(now());
  // Only say "limits used up" when something was actually over quota; otherwise it was a server/network problem.
  if (sawServer && !sawQuota && !sawUnavailable) throw new AiError('server');
  if (retryAt) throw new AiError('exhausted', retryAt);
  if (sawUnavailable || !tried) throw new AiError('no_model');
  throw new AiError('exhausted', nextPacificMidnight(now()));
}
