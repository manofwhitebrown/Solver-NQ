import { Button, Card } from '@/components/ui';
import { Icon } from './icons';
import { Markdown } from './Markdown';

/** The answer hero: a brand bar across the top, a check mark, larger maths. In Learn mode it stays hidden until the steps are done or the user taps Reveal. */
export function FinalAnswerCard({ text, hidden, onReveal }: { text: string; hidden: boolean; onReveal: () => void }) {
  return (
    <Card className="relative overflow-hidden border-accent/30 bg-accent-soft">
      <span aria-hidden className="brand-grad absolute inset-x-0 top-0 h-1.5" />
      <p className="mb-3 mt-1 flex items-center gap-2 text-sm font-bold text-accent">
        <span aria-hidden className="brand-grad flex h-6 w-6 items-center justify-center rounded-full text-accent-ink"><Icon name="check" className="h-3.5 w-3.5" /></span>
        Final answer
      </p>
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
