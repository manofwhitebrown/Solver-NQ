import type { ReactNode } from 'react';
import { useOverlay } from './useOverlay';

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode; actions?: ReactNode }

export function Dialog({ open, onClose, title, children, actions }: Props) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 animate-[fade-in_200ms] bg-black/40" onClick={onClose} />
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="relative w-full max-w-md animate-[pop-in_200ms] elev-4 rounded-xl p-6 focus:outline-none"
      >
        <h2 className="mb-2 text-lg font-bold">{title}</h2>
        <div className="text-base text-ink-2">{children}</div>
        {actions && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{actions}</div>}
      </div>
    </div>
  );
}
