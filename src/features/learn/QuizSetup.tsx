import { useState } from 'react';
import { Button, Card, Checkbox, Field, Input, Select } from '@/components/ui';
import type { QuizConfig } from './quizTypes';

const SUBJECTS = ['', 'math', 'physics', 'chemistry', 'biology', 'coding', 'languages', 'history', 'commerce', 'other'];

export function QuizSetup({ onStart, loading, error }: { onStart: (c: QuizConfig) => void; loading: boolean; error?: string }) {
  const [cfg, setCfg] = useState<QuizConfig>({ subject: '', tag: '', count: 10, timed: false });
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-5">
      <h1 className="text-2xl font-semibold">Quiz</h1>
      <Card className="flex flex-col gap-4">
        <Field label="Subject" htmlFor="qz-subject">
          <Select id="qz-subject" value={cfg.subject} onChange={(e) => setCfg({ ...cfg, subject: e.target.value })}
            options={SUBJECTS.map((s) => ({ value: s, label: s ? s[0].toUpperCase() + s.slice(1) : 'All subjects' }))} />
        </Field>
        <Field label="Tag (optional)" htmlFor="qz-tag">
          <Input id="qz-tag" value={cfg.tag} onChange={(e) => setCfg({ ...cfg, tag: e.target.value })} placeholder="e.g. algebra" />
        </Field>
        <Field label="Number of questions" htmlFor="qz-count">
          <Select id="qz-count" value={String(cfg.count)} onChange={(e) => setCfg({ ...cfg, count: Number(e.target.value) })}
            options={[5, 10, 15, 20].map((n) => ({ value: String(n), label: String(n) }))} />
        </Field>
        <Checkbox label="Timed exam mode (1 minute per question)" checked={cfg.timed}
          onChange={(e) => setCfg({ ...cfg, timed: e.target.checked })} />
      </Card>
      {error && <p role="alert" className="text-[15px] text-bad">{error}</p>}
      <Button block loading={loading} onClick={() => onStart(cfg)}>Start quiz</Button>
    </div>
  );
}
