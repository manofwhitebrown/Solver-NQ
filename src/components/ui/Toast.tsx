import { useEffect, useState } from 'react';
import { cn } from './cn';

type Kind = 'info' | 'success' | 'error';
interface ToastItem { id: number; text: string; kind: Kind }

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Call from anywhere: toast('Saved'), toast('Could not save', 'error'). */
export function toast(text: string, kind: Kind = 'info', ms = 3500): void {
  const id = nextId++;
  items = [...items, { id, text, kind }];
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, ms);
}

const dot: Record<Kind, string> = { info: 'bg-accent', success: 'bg-ok', error: 'bg-bad' };

/** Mount once, in the app shell. */
export function Toaster() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={{ bottom: 'calc(5.5rem + var(--sab))' }}
    >
      {items.map((t) => (
        <div key={t.id} role="status" className="pointer-events-auto flex max-w-sm animate-[pop-in_200ms] items-center gap-3 rounded-md bg-ink px-4 py-3 text-sm text-bg shadow-lift">
          <span className={cn('h-2 w-2 shrink-0 rounded-full', dot[t.kind])} />
          {t.text}
        </div>
      ))}
    </div>
  );
}
