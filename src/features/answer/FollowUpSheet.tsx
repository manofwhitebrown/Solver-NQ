import type { Step } from '@/types';
import { IconButton } from '@/components/ui';
import { useOverlay } from '@/components/ui/useOverlay';
import { FollowUpChat } from './FollowUpChat';
import { Icon } from './icons';

/** Phone follow-up chat: a full-height sheet whose input stays at the bottom. */
export function FollowUpSheet({ open, onClose, answerId, onStep }: {
  open: boolean; onClose: () => void; answerId: string; onStep: (s: Step) => Promise<void>;
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Follow-up"
      className="fixed inset-0 z-50 flex h-[100dvh] animate-[sheet-up_240ms_cubic-bezier(.2,.8,.2,1)] flex-col bg-surface focus:outline-none lg:hidden"
      style={{ paddingTop: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
      <header className="flex items-center justify-between border-b border-line px-5 py-2">
        <h2 className="text-lg font-bold">Follow-up</h2>
        <IconButton label="Close" onClick={onClose}><Icon name="close" className="h-6 w-6" /></IconButton>
      </header>
      <div className="min-h-0 flex-1 px-5 pt-4" style={{ paddingBottom: 'calc(1rem + var(--sab))' }}>
        <FollowUpChat answerId={answerId} onStep={onStep} />
      </div>
    </div>
  );
}
