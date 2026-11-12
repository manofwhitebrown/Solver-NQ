import type { ReactNode } from 'react';
import { useOverlay } from './useOverlay';

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

export function BottomSheet({ open, onClose, title, children }: Props) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 animate-[fade-in_200ms] bg-black/40" onClick={onClose} />
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="relative max-h-[85dvh] w-full max-w-lg animate-[sheet-up_240ms_cubic-bezier(.2,.8,.2,1)] overflow-y-auto rounded-t-xl bg-surface px-5 pt-3 shadow-lift focus:outline-none lg:rounded-xl"
        style={{ paddingBottom: 'calc(1.5rem + var(--sab))' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line lg:hidden" />
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
