import { useState } from 'react';
import { loadQuiz } from './loadQuiz';
import { QuizResults } from './QuizResults';
import { QuizRun } from './QuizRun';
import { QuizSetup } from './QuizSetup';
import type { Outcome, QuizConfig, QuizSession } from './quizTypes';

export function QuizPage() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [run, setRun] = useState(0); // bump to remount QuizRun on retry

  const start = async (cfg: QuizConfig) => {
    setLoading(true); setError(undefined);
    try {
      const r = await loadQuiz(cfg);
      if ('error' in r) setError(r.error); else { setSession(r); setOutcomes(null); setRun((n) => n + 1); }
    } catch { setError('Could not load your questions. Please try again.'); }
    finally { setLoading(false); }
  };

  const retryWrong = (ids: string[]) => {
    if (!session) return;
    const items = session.items.filter((it) => ids.includes(it.questionId));
    setSession({ ...session, items, timedSeconds: session.timedSeconds === null ? null : items.length * 60 });
    setOutcomes(null); setRun((n) => n + 1);
  };

  if (!session) return <QuizSetup onStart={start} loading={loading} error={error} />;
  if (!outcomes) return <QuizRun key={run} session={session} onFinish={setOutcomes} />;
  return <QuizResults session={session} outcomes={outcomes} onRetryWrong={retryWrong} />;
}
