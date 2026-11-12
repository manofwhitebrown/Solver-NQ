import { Button, Textarea } from '@/components/ui';
import { isLowConfidence, suggestsRotate } from '@/lib/ocr';

export interface ScanItem { id: string; dataUrl: string; text: string; confidence: number; busy: boolean }
interface Props {
  item: ScanItem; onText: (t: string) => void; onAsk: () => void; onImageOnly: () => void; onRemove: () => void; onRotate: () => void;
}

export function ResultCard({ item, onText, onAsk, onImageOnly, onRemove, onRotate }: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <img src={item.dataUrl} alt="Cropped question" className="max-h-40 w-full rounded-md object-contain bg-raised" />
      {item.busy ? (
        <p className="text-sm text-ink-soft" role="status">Reading the text…</p>
      ) : (
        <>
          {isLowConfidence(item.confidence) && (
            <p className="rounded-md bg-raised p-3 text-sm" role="status">
              Check the text — we weren&apos;t very sure about this one. Fix anything that looks off.
            </p>
          )}
          {suggestsRotate(item.confidence) && (
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-raised p-3 text-sm" role="status">
              <span>Try rotating the photo. It may be sideways.</span>
              <Button variant="secondary" onClick={onRotate}>Rotate and read again</Button>
            </div>
          )}
          <Textarea value={item.text} onChange={e => onText(e.target.value)} rows={4}
            aria-label="Recognised text" placeholder="No text found. Type the question here." />
        </>
      )}
      <p className="text-xs text-ink-soft">
        Handwriting and complex formulas work better with the image sent to the AI.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onAsk} disabled={item.busy || !item.text.trim()}>Ask</Button>
        <Button variant="secondary" onClick={onImageOnly} disabled={item.busy}>Send image only</Button>
        <Button variant="ghost" onClick={onRemove}>Remove</Button>
      </div>
    </div>
  );
}
