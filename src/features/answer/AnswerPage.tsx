import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Share } from '@capacitor/share';
import type { Answer, Question } from '@/types';
import { Button, Card, EmptyState, PageHeader, Skeleton, Spinner, Stack, toast } from '@/components/ui';
import { tts } from '@/lib/tts';
import * as ai from '@/lib/ai';
import { ActionChips } from './ActionChips';
import { answerToMarkdown } from './answerText';
import { copyText } from './clipboard';
import { FinalAnswerCard } from './FinalAnswerCard';
import { FollowUpChat } from './FollowUpChat';
import { FollowUpSheet } from './FollowUpSheet';
import { MoreSheet } from './MoreSheet';
import { PhoneBar } from './PhoneBar';
import { QuestionCard } from './QuestionCard';
import { findGraphable } from './graphFind';
import { Icon } from './icons';
import { ModelLabel } from './ModelLabel';
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
    <Shell><EmptyState icon={<Spinner label="Waiting" />} title="Saved - will answer when it can"
      text="Your question is safe. It will be answered when you're back online or the free quota resets, and the answer will appear here and in your library."
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

/** AI-2 exports getPrimaryModel(); until it exists we only show the model name. */
const primaryModel = (): string | undefined =>
  (ai as unknown as { getPrimaryModel?: () => string }).getPrimaryModel?.();

const Shell = ({ children }: { children: React.ReactNode }) => (
  <>
    <PageHeader title="Answer" back />
    {children}
  </>
);

function LoadingSkeleton() {
  return (
    <Stack gap={4} aria-busy="true" aria-label="Loading answer">
      <Skeleton className="h-28 w-full" /><Skeleton className="h-32 w-full" />
      <Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" />
    </Stack>
  );
}

function AnswerBody({ q, a, updateQuestion, addFollowUp }: {
  q: Question; a: Answer;
  updateQuestion: (p: Partial<Question>) => Promise<void>; addFollowUp: (s: Answer['steps'][number]) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [revealed, setRevealed] = useState(a.mode === 'answer' || a.steps.filter((s) => !s.id.startsWith('fu-')).length === 0);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const graphFn = findGraphable(q.text, a.finalAnswer);

  /** Ask again with the cache skipped so the first-choice model gets another go. */
  const retryBest = async () => {
    setRetrying(true);
    try {
      const r = await ai.askQuestion({ text: q.text, subject: q.subject, mode: a.mode }, undefined, { skipCache: true });
      if ('answerId' in r) navigate(`/answer/${r.answerId}`, { replace: true });
      else toast('The best model is busy right now. Your question is saved and will be retried later.', 'success');
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not retry', 'error'); } finally { setRetrying(false); }
  };

  const copy = async () => { toast((await copyText(answerToMarkdown(q, a))) ? 'Copied' : 'Could not copy', 'success'); };
  const share = async () => {
    const text = answerToMarkdown(q, a);
    try {
      if ((await Share.canShare()).value) await Share.share({ title: 'Solver-NQ answer', text });
      else await copy();
    } catch { /* user closed the share sheet */ }
  };
  const actions = {
    q, a, graphFn,
    onStar: () => void updateQuestion({ starred: !q.starred }), onTags: () => setTagsOpen(true),
    onCards: () => navigate(`/learn/cards/new?answer=${a.id}`), onExport: () => navigate(`/export?ids=${q.id}`),
    onShare: () => void share(), onCopy: () => void copy(),
  };

  return (
    <div className="pb-20 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:pb-0">
      <Stack gap={8} className="min-w-0">
        <Stack gap={4}>
          <QuestionCard subject={q.subject} text={q.text} />
          <Toolbar {...actions} />
          <FinalAnswerCard text={a.finalAnswer} hidden={!revealed} onReveal={() => setRevealed(true)} />
          {revealed && <VerifyBadge verified={a.verified} />}
          {revealed && <ModelLabel model={a.model} primary={primaryModel()} onRetry={() => void retryBest()} busy={retrying} />}
        </Stack>
        <Steps steps={a.steps} initialMode={a.mode} onAllRevealed={(done) => done && setRevealed(true)} />
        <Stack gap={4}>
          <ActionChips answerId={a.id} onStep={addFollowUp} />
          <Button variant="secondary" block className="lg:hidden" onClick={() => setChatOpen(true)}>
            <Icon name="chat" className="mr-2 h-5 w-5" />Ask a follow-up
          </Button>
          {q.tags.length > 0 && <p className="text-base text-ink-2">Tags: {q.tags.join(', ')}</p>}
        </Stack>
      </Stack>
      <Card className="sticky top-6 hidden h-[calc(100dvh-3rem)] lg:block" aria-label="Follow-up chat">
        <h2 className="mb-4 text-lg font-semibold">Follow-up</h2>
        <div className="h-[calc(100%-2.75rem)]"><FollowUpChat answerId={a.id} onStep={addFollowUp} /></div>
      </Card>
      <PhoneBar q={q} onStar={actions.onStar} onCards={actions.onCards} onExport={actions.onExport} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} a={a} graphFn={graphFn}
        onTags={actions.onTags} onShare={actions.onShare} onCopy={actions.onCopy} />
      <FollowUpSheet open={chatOpen} onClose={() => setChatOpen(false)} answerId={a.id} onStep={addFollowUp} />
      <TagsSheet open={tagsOpen} tags={q.tags} onClose={() => setTagsOpen(false)} onChange={(tags) => void updateQuestion({ tags })} />
    </div>
  );
}
