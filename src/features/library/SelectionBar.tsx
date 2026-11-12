import { Button, IconButton } from '@/components/ui';

interface Props {
  count: number; onExport: () => void; onTag: () => void; onStar: () => void;
  onDelete: () => void; onCancel: () => void;
}

export function SelectionBar({ count, onExport, onTag, onStar, onDelete, onCancel }: Props) {
  return (
    // Floats above the phone tab bar (about 72px tall); sits near the bottom on laptop.
    <div className="fixed left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 shadow-lift bottom-[calc(4.75rem+var(--sab))] lg:bottom-6">
      <IconButton label="Cancel selection" onClick={onCancel}>✕</IconButton>
      <span className="mr-auto whitespace-nowrap text-sm font-medium">{count} selected</span>
      <Button variant="ghost" className="px-2" onClick={onExport}>Export</Button>
      <Button variant="ghost" className="px-2" onClick={onTag}>Tag</Button>
      <IconButton label="Star selected" onClick={onStar}>★</IconButton>
      <Button variant="ghost" className="px-2 text-bad" onClick={onDelete}>Delete</Button>
    </div>
  );
}
