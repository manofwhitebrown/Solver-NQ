import { Button, Card, Spinner } from '@/components/ui';

export function Thinking({ onCancel }: { onCancel: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center" aria-live="polite">
      <Spinner label="Working on your answer" className="text-accent" />
      <div>
        <p className="font-semibold">Working through it…</p>
        <p className="mt-1 text-[15px] text-muted">This usually takes a few seconds.</p>
      </div>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    </Card>
  );
}
