import { useFallbackState } from '@/features/ai-settings/useFallbackState';
import { formatTime } from '@/lib/ai/errors';
import { slotInfo } from '@/lib/ai/fallback';

/** Calm status under Send when the first-choice model is resting, so a different one will answer. */
export function FallbackNote() {
  const state = useFallbackState();
  const first = state.chain.find(c => c.enabled);
  if (!first || !state.keys.length) return null;
  const info = slotInfo(state, first);
  if (info.status === 'ready') return null;
  const why = info.status === 'cooling' && info.until ? `cooling down until ${formatTime(info.until)}` : 'not available right now';
  return <p role="status" className="text-sm text-muted">{first.model} is {why}. The next model in your list will answer.</p>;
}
