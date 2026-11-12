import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Share } from '@capacitor/share';
import type { Answer, Question } from '@/types';
import { BottomSheet, Button, Card, EmptyState, Skeleton, Spinner, toast } from '@/components/ui';
import { tts } from '@/lib/tts';
import { ActionChips } from './ActionChips';
import { answerToMarkdown } from './answerText';
import { copyText } from './clipboard';
import { FinalAnswerCard } from './FinalAnswerCard';
import { FollowUpChat } from './FollowUpChat';
import { findGraphable } from './graphFind';
import { Icon } from './icons';
import { Markdown } from './Markdown';
import { Steps } from './Steps';
import { TagsSheet } from './TagsSheet';
import { Toolbar } from './Toolbar';
import { useAnswer } from './useAnswer';
import { VerifyBadge } from './VerifyBadge';

export default function AnswerPage() {
  const { id } = useParams();
  const { state, retry, updateQuestion, addFollowUp } = useAnswer(id);
  useEffect(() => () => tts.stop(), [id]);

  if (state.status === 'loading') return <Shell><LoadingSkeleton /></Shell>;
  if (state.status === 'queued') return (
    <Shell><EmptyState icon={<Spinner label="Waiting" />} title="Queued - will answer when you're online"
      text="Your question is saved. The answer appears here and in your library as soon as the connection returns."
      action={<Link to="/library" className="text-accent underline">Go to library</Link>} /></Shell>
  );
  if (state.status === 'missing') return (
    <Shell><EmptyState title="Answer not found" text="It may have been deleted."
      action={<Link to="/" className="text-accent underline">Ask a new question</Link>} /></Shell>
  );
  if (state.status === 'error') return (
    <Shell><EmptyState title="Could not open this answer" text={state.message}
      action={<Button onClick={retry}>Retry</Button>} /></Shell>
  );
  return (
    <Shell>
      <AnswerBody key={state.a.id} q={state.q} a={state.a} updateQuestion={updateQuestion} addFollowUp={addFollowUp} />
    </Shell>
  );
}

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-5xl px-4 py-4 pb-8">{children}</div>
);

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading answer">
      <Skeleton className="h-20 w-full" /><Skeleton className="h-28 w-full" />
      <Skeleton className="h-6 w-24" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
    </div>
  );
}

function AnswerBody({ q, a, updateQuestion, addFollowUp }: {
  q: Question; a: Answer;
  updateQuestion: (p: Partial<Question>) => Promise<void>; addFollowUp: (s: Answer['steps'][number]) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(a.mode === 'answer' || a.steps.filter((s) => !s.id.startsWith('fu-')).length === 0);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const graphFn = findGraphable(q.text, a.finalAnswer);

  const copy = async () => { toast((await copyText(answerToMarkdown(q, a))) ? 'Copied' : 'Could not copy', 'success'); };
  const share = async () => {
    const text = answerToMarkdown(q, a);
    try {
      if ((await Share.canShare()).value) await Share.share({ title: 'Solver-NQ answer', text });
      else await copy();
    } catch { /* user closed the share sheet */ }
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
      <div className="min-w-0 space-y-4">
        <Card className="p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{q.subject}</p>
          <Markdown>{q.text}</Markdown>
        </Card>
        <Toolbar q={q} a={a} graphFn={graphFn}
          onStar={() => void updateQuestion({ starred: !q.starred })} onTags={() => setTagsOpen(true)}
          onCards={() => navigate(`/learn/cards/new?answer=${a.id}`)} onExport={() => navigate(`/export?ids=${q.id}`)}
          onShare={() => void share()} onCopy={() => void copy()} />
        <FinalAnswerCard text={a.finalAnswer} hidden={!revealed} onReveal={() => setRevealed(true)} />
        {revealed && <VerifyBadge verified={a.verified} />}
        <Steps steps={a.steps} initialMode={a.mode} onAllRevealed={(done) => done && setRevealed(true)} />
        <ActionChips answerId={a.id} onStep={addFollowUp} />
        <Button variant="secondary" block className="lg:hidden" onClick={() => setChatOpen(true)}>
          <Icon name="chat" />Ask a follow-up
        </Button>
        {q.tags.length > 0 && <p className="text-sm text-muted">Tags: {q.tags.join(', ')}</p>}
      </div>
      <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] rounded-lg border border-line bg-surface p-4 lg:block" aria-label="Follow-up chat">
        <h2 className="mb-3 text-lg font-semibold">Follow-up</h2>
        <div className="h-[calc(100%-2.5rem)]"><FollowUpChat answerId={a.id} onStep={addFollowUp} /></div>
      </aside>
      <BottomSheet open={chatOpen} onClose={() => setChatOpen(false)} title="Follow-up">
        <div className="h-[55dvh]"><FollowUpChat answerId={a.id} onStep={addFollowUp} /></div>
      </BottomSheet>
      <TagsSheet open={tagsOpen} tags={q.tags} onClose={() => setTagsOpen(false)} onChange={(tags) => void updateQuestion({ tags })} />
    </div>
  );
}
