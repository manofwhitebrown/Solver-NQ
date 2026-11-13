import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Cluster, Stack } from '@/components/ui';
import { CameraIcon, LearnIcon, OfflineIcon } from '@/components/ui/icons';
import { Logo } from '@/app/Logo';
import { updateSettings } from '@/lib/settings';
import { StepKey } from './StepKey';
import { StepMode } from './StepMode';

const TITLES = ['Welcome to Solver-NQ', 'Add your free key', 'How should I help?'];

const FEATURES = [
  { Icon: CameraIcon, title: 'Scan or type', text: 'Snap a page or type a problem and get a clear, step-by-step solution.' },
  { Icon: LearnIcon, title: 'Learn it for real', text: 'Flashcards, quizzes and a study planner built from your own questions.' },
  { Icon: OfflineIcon, title: 'Yours, offline', text: 'Everything is saved on this device and opens without internet.' },
];

/** Three pill segments: done = filled brand gradient, current = filled, upcoming = outline. */
function Progress({ step }: { step: number }) {
  return (
    <div className="flex gap-2" role="img" aria-label={`Step ${step + 1} of ${TITLES.length}`}>
      {TITLES.map((t, i) => <span key={t} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'brand-grad' : 'bg-line'}`} />)}
    </div>
  );
}

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const finish = () => { updateSettings({ onboarded: true }); nav('/', { replace: true }); };
  const last = step === TITLES.length - 1;

  return (
    <Stack gap={6} className="mx-auto w-full max-w-read px-5 pb-10 pt-6 md:px-7 lg:pt-12">
      <Progress step={step} />
      {step === 0 ? (
        <div className="brand-grad relative overflow-hidden rounded-xl p-7 text-accent-ink shadow-glow">
          <span aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15" />
          <span aria-hidden className="absolute -bottom-14 right-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="-ml-3 mb-5 [&_*]:!text-accent-ink"><Logo /></div>
            <p className="text-sm font-semibold opacity-80">Step 1 of {TITLES.length}</p>
            <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-tight lg:text-4xl">{TITLES[0]}</h1>
            <p className="mt-3 max-w-sm text-read opacity-90">Your calm, free study helper for every subject.</p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-muted">Step {step + 1} of {TITLES.length}</p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink lg:text-4xl">{TITLES[step]}</h1>
        </div>
      )}
      {step === 0 && (
        <Stack gap={3}>
          {FEATURES.map(({ Icon, title, text }) => (
            <Card key={title} className="flex items-start gap-4 !p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent"><Icon size={24} /></span>
              <div>
                <h2 className="text-base font-bold text-ink">{title}</h2>
                <p className="text-sm text-ink-2">{text}</p>
              </div>
            </Card>
          ))}
        </Stack>
      )}
      {step === 1 && <Card><StepKey onAdded={() => setStep(2)} /></Card>}
      {step === 2 && <Card><StepMode /></Card>}
      <Cluster gap={3} className="justify-between">
        <Button variant="ghost" onClick={finish}>Skip</Button>
        <Cluster gap={3}>
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={last ? finish : () => setStep(step + 1)}>{last ? 'Start' : 'Next'}</Button>
        </Cluster>
      </Cluster>
    </Stack>
  );
}
