import { useSyncExternalStore } from 'react';
import { loadState, subscribe } from '@/lib/ai/fallback';
import type { FallbackState } from '@/lib/ai/fallback';

/** Re-renders when keys, chain or cooldowns change. */
export function useFallbackState(): FallbackState {
  return useSyncExternalStore(subscribe, () => loadState());
}
