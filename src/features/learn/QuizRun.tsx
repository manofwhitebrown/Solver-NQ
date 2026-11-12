import { useEffect, useState } from 'react';
import { Button, Card, Stack } from '@/components/ui';
import { isCorrectChoice, remainingSeconds } from '@/lib/srs';
import { CardText } from './CardText';
import type { Outcome, QuizSession } from './quizTypes';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function QuizRun({ session, onFinish }: { session: QuizSession; onFinish: (o: Outcome[]) => void }) {
  const { items, timedSeconds } = session;
  const [i, setI] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);   // MC choice
  const [revealed, setRevealed] = useState(false);              // short answer shown
  const [startedAt] = useState(() => Date.now());
  const [left, setLeft] = useState(timedSeconds);

  // Timed mode: tick, and when time is up count every unanswered item as wrong.
  useEffect(() => {
    if (timedSeconds === null) return;
    const t = setInterval(() => {
      const r = remainingSeconds(startedAt, timedSeconds);
      setLeft(r);
      if (r === 0) {
        clearInterval(t);
        const rest = items.slice(outcomes.length).map((item) => ({ item, correct: false }));
        onFinish([...outcomes, ...rest]);
      }
    }, 500);
    return () => clearInterval(t);
  }, [timedSeconds, startedAt, items, outcomes, onFinish]);

  const item = items[i];
  const answered = item.options ? chosen !== null : revealed;
  const record = (correct: boolean) => {
    const next = [...outcomes, { item, correct }];
    if (i + 1 >= items.length) return onFinish(next);
    setOutcomes(next); setI(i + 1); setChosen(null); setRevealed(false);
  };

  return (
    <Stack gap={5}>
      <div className="flex items-center justify-between text-sm font-semibold text-ink-2">
        <span>Question {i + 1} of {items.length}</span>
        {left !== null && <span className={left <= 30 ? 'font-semibold text-bad' : ''} aria-live="off">{mmss(left)}</span>}
      </div>
      <Card><div className="text-[17px] leading-[1.7]"><CardText>{item.prompt}</CardText></div></Card>

      {item.options ? (
        <div className="flex flex-col gap-3">
          {item.options.map((o) => {
            const right = chosen !== null && isCorrectChoice(o, item.answer);
            const wrong = chosen !== null && !right && o === chosen;
            const state = right ? 'border-good bg-good/10 border-2' : wrong ? 'border-bad bg-bad/10 border-2' : chosen !== null ? 'opacity-60' : '';
            return (
              <button key={o} type="button" disabled={chosen !== null} onClick={() => setChosen(o)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-md border border-line-strong bg-surface px-4 py-3 text-left text-base transition ${state}`}>
                <span className="min-w-0"><CardText>{o}</CardText></span>
                {right && <span className="shrink-0 text-sm font-bold text-good" aria-label="Correct">✓ Correct</span>}
                {wrong && <span className="shrink-0 text-sm font-bold text-bad" aria-label="Wrong">✗ Wrong</span>}
              </button>
            );
          })}
        </div>
      ) : revealed ? (
        <Card className="border-accent"><p className="mb-2 text-caption font-semibold uppercase tracking-wide text-muted">Answer</p>
          <CardText>{item.answer}</CardText></Card>
      ) : (
        <Button block onClick={() => setRevealed(true)}>Show answer</Button>
      )}

      {answered && item.explanation && <div className="text-[15px] text-ink-2"><CardText>{item.explanation}</CardText></div>}

      {item.options && chosen !== null && (
        <Button block onClick={() => record(isCorrectChoice(chosen, item.answer))}>
          {i + 1 >= items.length ? 'See results' : 'Next'}
        </Button>
      )}
      {!item.options && revealed && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => record(false)}>Missed it</Button>
          <Button onClick={() => record(true)}>Got it</Button>
        </div>
      )}
    </Stack>
  );
}
