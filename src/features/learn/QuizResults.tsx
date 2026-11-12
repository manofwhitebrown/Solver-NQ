import { Link } from 'react-router-dom';
import { Button, Card, PageHeader, Section, Stack } from '@/components/ui';
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
    <>
      <PageHeader title="Results" />
      <Section><Stack gap={5}>
      <Card className="text-center">
        <p className="text-4xl font-bold text-ink">{s.percent}%</p>
        <p className="mt-1 text-base text-ink-2">{s.correct} of {s.total} correct</p>
      </Card>

      <h2 className="text-xl font-semibold text-ink">Weak topics</h2>
      {weak.length === 0 ? <p className="text-base text-ink-2">Nothing weak here. Nice work.</p> : (
        <ul className="flex flex-col gap-4">
          {weak.map((t) => (
            <li key={t.topic}>
              <Card className="min-h-[64px] py-4 lg:py-4">
                <div className="flex justify-between text-base"><span className="font-semibold capitalize">{t.topic}</span>
                  <span className="text-ink-2">{t.correct}/{t.total}</span></div>
                <div className="mt-2 h-2 rounded-full bg-line" role="presentation">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.round(t.accuracy * 100)}%` }} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3">
        {wrong.length > 0 && <Button block onClick={() => onRetryWrong(wrong)}>Retry the {wrong.length} wrong</Button>}
        <Link to="/learn" className="block"><Button block variant="secondary">Back to Learn</Button></Link>
      </div>
      </Stack></Section>
    </>
  );
}
