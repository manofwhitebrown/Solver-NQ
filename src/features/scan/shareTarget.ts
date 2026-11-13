import { registerPlugin } from '@capacitor/core';

interface ShareTargetApi {
  getShared(): Promise<{ dataUrl?: string; error?: string }>;
  addListener(event: 'shared', cb: () => void): Promise<{ remove: () => Promise<void> }>;
}
const ShareTarget = registerPlugin<ShareTargetApi>('ShareTarget');

/** A pending image shared into the app from another app (Android only). Null when none, or on the web. */
export async function takeSharedImage(): Promise<{ blob?: Blob; error?: string } | null> {
  try {
    const r = await ShareTarget.getShared();
    if (r.error) return { error: r.error };
    if (!r.dataUrl) return null;
    return { blob: await (await fetch(r.dataUrl)).blob() };
  } catch { return null; } // plugin missing (web) or call failed
}

/** Calls cb whenever another share arrives while the app is open. Returns an unsubscribe function. */
export function onSharedImage(cb: () => void): () => void {
  let remove: (() => Promise<void>) | undefined; let dead = false;
  ShareTarget.addListener('shared', cb).then(h => { if (dead) void h.remove(); else remove = h.remove; }).catch(() => { /* web */ });
  return () => { dead = true; void remove?.(); };
}
