import { Button, Card } from '@/components/ui';
import { Markdown } from './Markdown';

/** The answer, clearly distinct from the steps. In Learn mode it stays hidden until the steps are done or the user taps Reveal. */
export function FinalAnswerCard({ text, hidden, onReveal }: { text: string; hidden: boolean; onReveal: () => void }) {
  return (
    <Card className="border-accent/30 bg-accent-soft">
      <p className="mb-3 text-sm font-semibold text-accent">Final answer</p>
      {hidden ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-base text-ink-2">Hidden so you can try it first.</p>
          <Button variant="secondary" onClick={onReveal}>Reveal answer</Button>
        </div>
      ) : (
        <Markdown size="final">{text}</Markdown>
      )}
    </Card>
  );
}
