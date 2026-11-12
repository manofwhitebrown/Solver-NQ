import { AiError } from '../errors';
import { SlotFailure, callSlot } from './slotCall';
import { loadState } from './store';
import type { ModelSlot } from './types';

/** "Test connection" for one slot. Uses one tiny request; does not touch cooldowns. */
export async function testSlot(slot: ModelSlot): Promise<{ ok: boolean; message: string }> {
  const s = loadState();
  const k = s.keys.find(x => x.provider === slot.provider && !s.invalidKeys.includes(x.id) && (!slot.keyId || x.id === slot.keyId));
  if (!k) return { ok: false, message: 'No working key for this model.' };
  try {
    await callSlot(k, slot.model, { system: 'Reply with the single word OK.', messages: [{ role: 'user', content: 'ping' }] });
    return { ok: true, message: 'Works.' };
  } catch (e) {
    if (e instanceof AiError) return { ok: false, message: e.message };
    const kind = e instanceof SlotFailure ? e.failure.kind : 'transient';
    const msg: Record<string, string> = {
      quota: 'Limit reached for now. It will work again later.', unavailable: 'This model is not available to you.',
      badkey: 'The key was rejected.', transient: 'The service did not respond. Try again.',
      safety: 'Blocked by a safety filter.', badrequest: 'The model name was not accepted.',
    };
    return { ok: false, message: msg[kind] ?? 'Failed.' };
  }
}
