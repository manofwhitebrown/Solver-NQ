import { Button, IconButton } from '@/components/ui';

interface Props {
  count: number; onExport: () => void; onTag: () => void; onStar: () => void;
  onDelete: () => void; onCancel: () => void;
}

export function SelectionBar({ count, onExport, onTag, onStar, onDelete, onCancel }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-1 border-t border-line bg-surface px-3 pt-2 lg:left-auto"
      style={{ paddingBottom: 'calc(0.5rem + var(--sab))' }}>
      <IconButton label="Cancel selection" onClick={onCancel}>✕</IconButton>
      <span className="mr-auto text-sm font-medium">{count} selected</span>
      <Button variant="ghost" className="px-3" onClick={onExport}>Export</Button>
      <Button variant="ghost" className="px-3" onClick={onTag}>Tag</Button>
      <IconButton label="Star selected" onClick={onStar}>★</IconButton>
      <Button variant="ghost" className="px-3 text-bad" onClick={onDelete}>Delete</Button>
    </div>
  );
}
