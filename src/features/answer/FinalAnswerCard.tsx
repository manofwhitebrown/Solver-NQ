import { Button, Card } from '@/components/ui';
import { Markdown } from './Markdown';

/** Highlighted answer. In Learn mode it stays hidden until the user has worked through the steps or taps Reveal. */
export function FinalAnswerCard({ text, hidden, onReveal }: { text: string; hidden: boolean; onReveal: () => void }) {
  return (
    <Card className="border-accent/40 bg-accent/5 p-4 shadow-soft">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">Final answer</p>
      {hidden ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">Hidden so you can try it first.</p>
          <Button variant="secondary" onClick={onReveal}>Reveal answer</Button>
        </div>
      ) : (
        <div className="text-[17px] font-medium"><Markdown>{text}</Markdown></div>
      )}
    </Card>
  );
}
