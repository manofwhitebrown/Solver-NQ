import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { score, weakTopics, wrongIds, type QuizResult } from '@/lib/srs';
import type { Outcome, QuizSession } from './quizTypes';

export function QuizResults({ session, outcomes, onRetryWrong }: {
  session: QuizSession; outcomes: Outcome[]; onRetryWrong: (ids: string[]) => void;
}) {
  const results: QuizResult[] = outcomes.map(({ item, correct }) => {
    const q = session.questions[item.questionId];
    return { questionId: item.questionId, subject: q?.subject ?? 'other', tags: q?.tags ?? [], correct };
  });
  const s = score(results);
  const weak = weakTopics(results).filter((t) => t.accuracy < 1);
  const wrong = wrongIds(results);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-5">
      <h1 className="text-2xl font-semibold">Results</h1>
      <Card className="text-center">
        <p className="text-4xl font-semibold">{s.percent}%</p>
        <p className="text-muted">{s.correct} of {s.total} correct</p>
      </Card>

      <h2 className="text-base font-semibold">Weak topics</h2>
      {weak.length === 0 ? <p className="text-[15px] text-muted">Nothing weak here. Nice work.</p> : (
        <ul className="flex flex-col gap-2">
          {weak.map((t) => (
            <li key={t.topic}>
              <Card className="py-3">
                <div className="flex justify-between text-[15px]"><span className="font-medium capitalize">{t.topic}</span>
                  <span className="text-muted">{t.correct}/{t.total}</span></div>
                <div className="mt-2 h-2 rounded-full bg-line" role="presentation">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.round(t.accuracy * 100)}%` }} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 pt-2">
        {wrong.length > 0 && <Button block onClick={() => onRetryWrong(wrong)}>Retry the {wrong.length} wrong</Button>}
        <Link to="/learn"><Button block variant="secondary">Back to Learn</Button></Link>
      </div>
    </div>
  );
}
