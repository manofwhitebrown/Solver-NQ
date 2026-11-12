import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadNoteQuiz } from './loadNoteQuiz';
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
  const noteId = useSearchParams()[0].get('note');

  useEffect(() => {
    if (!noteId) return;
    let live = true;
    setLoading(true);
    loadNoteQuiz(noteId)
      .then((r) => { if (!live) return; if ('error' in r) setError(r.error); else { setSession(r); setOutcomes(null); setRun((n) => n + 1); } })
      .catch(() => { if (live) setError('Could not load the note. Please try again.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [noteId]);

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
