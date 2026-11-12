import { Button } from '@/components/ui';

export function ImagePreview({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2">
      <img src={src} alt="Scanned question" className="h-14 w-14 rounded-md object-cover" />
      <p className="flex-1 text-sm text-muted">Photo attached. The AI will read it too.</p>
      <Button variant="ghost" onClick={onRemove} aria-label="Remove photo">Remove</Button>
    </div>
  );
}
