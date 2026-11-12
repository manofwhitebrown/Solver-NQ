import { Button } from '@/components/ui';

/** Calm "Answered by" line. A fallback answer gets a soft chip and, when possible, a retry. */
export function ModelLabel({ model, primary, onRetry, busy }: {
  model: string; primary?: string; onRetry?: () => void; busy?: boolean;
}) {
  if (!model) return null;
  const fallback = !!primary && primary !== model;
  if (!fallback) return <p className="text-sm text-muted">Answered by {model}</p>;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-accent-soft px-4 py-3 text-sm">
      <span>Answered by <strong>{model}</strong>, a backup model. Answers are still checked the same way.</span>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} disabled={busy}>Retry with best model</Button>
      )}
    </div>
  );
}
