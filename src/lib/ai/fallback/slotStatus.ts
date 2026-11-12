import { activeCooldown } from './store';
import type { FallbackState, ModelSlot, SlotStatus } from './types';

export interface SlotInfo { status: SlotStatus; until?: number }

/** What the settings panel shows per slot: Ready / Cooling down until HH:MM / Unavailable / Key invalid. */
export function slotInfo(s: FallbackState, slot: ModelSlot, now = Date.now()): SlotInfo {
  const keys = s.keys.filter(k => k.provider === slot.provider && (!slot.keyId || k.id === slot.keyId));
  const usable = keys.filter(k => !s.invalidKeys.includes(k.id));
  if (!keys.length || !usable.length) return { status: 'key-invalid' };
  const cds = usable.map(k => activeCooldown(s, k, slot.model, now));
  if (cds.some(c => !c)) return { status: 'ready' };
  const kinds = cds as NonNullable<(typeof cds)[number]>[];
  if (kinds.every(c => c.kind === 'unavailable')) return { status: 'unavailable' };
  return { status: 'cooling', until: Math.min(...kinds.filter(c => c.kind === 'cooldown').map(c => c.until)) };
}
