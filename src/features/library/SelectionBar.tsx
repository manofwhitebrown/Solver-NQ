import { Download, Hash, Star, Trash2, X } from 'lucide-react';
import { ActionBar, Button, IconButton } from '@/components/ui';

interface Props {
  count: number; onExport: () => void; onTag: () => void; onStar: () => void;
  onDelete: () => void; onCancel: () => void;
}

/** The one sticky bar of the screen; ActionBar keeps it above the tab bar on phones. Every control is 44 px, even at 320 px wide. */
export function SelectionBar({ count, onExport, onTag, onStar, onDelete, onCancel }: Props) {
  return (
    <ActionBar className="z-40">
      <div className="flex w-full items-center gap-1 [&>*]:shrink-0">
        <IconButton label="Cancel selection" onClick={onCancel}><X size={20} aria-hidden /></IconButton>
        <span aria-live="polite" className="mr-auto hidden whitespace-nowrap px-2 text-sm font-semibold min-[360px]:inline">{count}<span className="hidden min-[440px]:inline"> selected</span></span>
        <span className="mr-auto min-[360px]:hidden" />
        <Button variant="secondary" className="gap-2 px-3 min-[440px]:px-5" aria-label="Export selected" onClick={onExport} disabled={!count}><Download size={16} aria-hidden /><span className="hidden min-[440px]:inline">Export</span></Button>
        <IconButton label="Tag selected" onClick={onTag} disabled={!count}><Hash size={20} aria-hidden /></IconButton>
        <IconButton label="Star selected" onClick={onStar} disabled={!count}><Star size={20} aria-hidden /></IconButton>
        <IconButton label="Delete selected" className="text-bad" onClick={onDelete} disabled={!count}><Trash2 size={20} aria-hidden /></IconButton>
      </div>
    </ActionBar>
  );
}
