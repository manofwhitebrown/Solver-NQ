import { listPending, removePending } from '@/lib/db';
import { toast } from '@/components/ui';
import { answerNow } from './ask';
import { AiError } from './errors';

let flushing = false;

/** Answer everything waiting in the queue. Stops at the first failure and keeps the rest. */
export async function flushPending(): Promise<void> {
  if (flushing || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  flushing = true;
  try {
    const items = (await listPending()).sort((a, b) => a.createdAt - b.createdAt);
    for (const item of items) {
      try {
        await answerNow({ text: item.text, subject: item.subject, mode: item.mode, imageDataUrl: item.imageDataUrl });
        await removePending(item.id);
        toast(`Answer ready: ${item.text.slice(0, 40)}${item.text.length > 40 ? '…' : ''}`, 'success');
      } catch (e) {
        if (e instanceof AiError && !e.retryable) toast(e.message, 'error'); // bad key etc: keep item, tell the user once
        break;
      }
    }
  } catch {
    /* db not ready: try again at the next trigger */
  } finally {
    flushing = false;
  }
}

/** Flush on app start and whenever the connection returns. Safe to call more than once. */
let started = false;
export function startQueueFlush(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('online', () => { void flushPending(); });
  void flushPending();
}
