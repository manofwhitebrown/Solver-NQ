import { Button, Card, Cluster, Stack, Textarea } from '@/components/ui';
import { isLowConfidence, suggestsRotate } from '@/lib/ocr';

export interface ScanItem { id: string; dataUrl: string; text: string; confidence: number; busy: boolean; progress?: number }
interface Props {
  item: ScanItem; onText: (t: string) => void; onAsk: () => void; onImageOnly: () => void; onRemove: () => void; onRotate: () => void; onReadAi: () => void;
}

export function ResultCard({ item, onText, onAsk, onImageOnly, onRemove, onRotate, onReadAi }: Props) {
  return (
    <Card><Stack gap={3}>
      <img src={item.dataUrl} alt="Cropped question" className="max-h-44 w-full rounded-md object-contain bg-raised" />
      {item.busy ? (
        <p className="text-base text-ink-2" role="status">Reading… {item.progress ?? 0}%</p>
      ) : (
        <>
          {isLowConfidence(item.confidence) && (
            <p className="rounded-md bg-warn-soft p-3 text-sm text-ink" role="status">
              Check the text — we weren&apos;t very sure about this one. Fix anything that looks off.
            </p>
          )}
          {suggestsRotate(item.confidence) && (
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-raised p-3 text-sm text-ink" role="status">
              <span>Try rotating the photo. It may be sideways.</span>
              <Button variant="secondary" onClick={onRotate}>Rotate and read again</Button>
            </div>
          )}
          <Textarea value={item.text} onChange={e => onText(e.target.value)} rows={5}
            aria-label="Recognised text" placeholder="No text found. Type the question here." />
        </>
      )}
      <p className="text-sm text-ink-2">
        Handwriting and complex formulas work better with the image sent to the AI.
      </p>
      <Button variant="secondary" onClick={onReadAi} disabled={item.busy}>
        Read with AI (better for handwriting and formulas)
      </Button>
      <Cluster gap={3}>
        <Button onClick={onAsk} disabled={item.busy || !item.text.trim()}>Ask</Button>
        <Button variant="secondary" onClick={onImageOnly} disabled={item.busy}>Send image only</Button>
        <Button variant="ghost" onClick={onRemove}>Remove</Button>
      </Cluster>
    </Stack></Card>
  );
}
