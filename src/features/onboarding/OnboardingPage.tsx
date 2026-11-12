import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Cluster, Stack } from '@/components/ui';
import { updateSettings } from '@/lib/settings';
import { StepKey } from './StepKey';
import { StepMode } from './StepMode';

const TITLES = ['Welcome to Solver-NQ', 'Add your free key', 'How should I help?'];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const finish = () => { updateSettings({ onboarded: true }); nav('/', { replace: true }); };
  const last = step === TITLES.length - 1;

  return (
    <Stack gap={6} className="pt-4">
      <div>
        <p className="text-sm font-semibold text-muted">Step {step + 1} of {TITLES.length}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink lg:text-3xl">{TITLES[step]}</h1>
      </div>
      <Card>
        {step === 0 && (
          <Stack gap={3}>
            <p className="text-read text-ink">Snap or type a problem, get a clear solution, and learn it with flashcards and quizzes.</p>
            <p className="text-base text-ink-2">Everything is saved on this device and works offline once you have answers.</p>
          </Stack>
        )}
        {step === 1 && <StepKey />}
        {step === 2 && <StepMode />}
      </Card>
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
