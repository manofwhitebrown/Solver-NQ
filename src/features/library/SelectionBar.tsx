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
        <IconButton label="Cancel selection" onClick={onCancel}>✕</IconButton>
        <span aria-live="polite" className="mr-auto hidden whitespace-nowrap px-2 text-sm font-semibold min-[360px]:inline">{count}<span className="hidden min-[400px]:inline"> selected</span></span>
        <span className="mr-auto min-[360px]:hidden" />
        <Button variant="secondary" onClick={onExport} disabled={!count}>Export</Button>
        <IconButton label="Tag selected" onClick={onTag} disabled={!count}>#</IconButton>
        <IconButton label="Star selected" onClick={onStar} disabled={!count}>★</IconButton>
        <IconButton label="Delete selected" className="text-bad" onClick={onDelete} disabled={!count}>🗑</IconButton>
      </div>
    </ActionBar>
  );
}
