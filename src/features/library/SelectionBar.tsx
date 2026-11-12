import { ActionBar, Button, IconButton } from '@/components/ui';

interface Props {
  count: number; onExport: () => void; onTag: () => void; onStar: () => void;
  onDelete: () => void; onCancel: () => void;
}

/** The one sticky bar of the screen; ActionBar keeps it above the tab bar on phones. */
export function SelectionBar({ count, onExport, onTag, onStar, onDelete, onCancel }: Props) {
  return (
    <ActionBar className="z-40">
      <IconButton label="Cancel selection" onClick={onCancel}>✕</IconButton>
      <span className="mr-auto whitespace-nowrap text-sm font-semibold">{count}<span className="hidden min-[380px]:inline"> selected</span></span>
      <Button size="sm" onClick={onExport} disabled={!count}>Export</Button>
      <Button size="sm" variant="secondary" onClick={onTag} disabled={!count}>Tag</Button>
      <IconButton label="Star selected" onClick={onStar} disabled={!count}>★</IconButton>
      <IconButton label="Delete selected" className="text-bad" onClick={onDelete} disabled={!count}>🗑</IconButton>
    </ActionBar>
  );
}
