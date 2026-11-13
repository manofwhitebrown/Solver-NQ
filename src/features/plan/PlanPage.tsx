import { useState } from 'react';
import { Button, Card, Cluster, EmptyState, PageHeader, Section, Skeleton, Stack } from '@/components/ui';
import { progressOf, type Exam } from '@/lib/plan';
import { useT } from '@/lib/i18n';
import { ExamCard } from './ExamCard';
import { ExamSheet } from './ExamSheet';
import { Ring } from './Ring';
import { SettingsSheet } from './SettingsSheet';
import { TaskRow } from './TaskRow';
import { usePlan } from './usePlan';
import { WeekView } from './WeekView';

export default function PlanPage() {
  const { t: tr } = useT();
  const { state, plan, today, update, toggle, loading } = usePlan();
  const [adding, setAdding] = useState(false);
  const [settings, setSettings] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  if (loading || !state) return <Skeleton className="h-40 w-full" />;
  const upcoming = state.exams.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const selected = picked && plan.some((d) => d.day === picked) ? picked : today;
  const day = plan.find((d) => d.day === selected);
  const todayDay = plan.find((d) => d.day === today);
  const prog = progressOf(todayDay?.tasks ?? [], state.done);
  const addExam = (e: Exam) => update({ exams: [...state.exams, e] });

  // The app's route wrapper already provides <Page> (gutters), so this screen starts with the header.
  return (
    <>
      <PageHeader title={tr('plan.title')} subtitle="A calm plan, one day at a time." />
      <Cluster gap={3} className="-mt-4 mb-8">
        <Button size="md" onClick={() => setAdding(true)}>{tr('plan.addExam')}</Button>
        <Button variant="secondary" size="md" onClick={() => setSettings(true)}>Plan settings</Button>
      </Cluster>
      {!upcoming.length ? (
        <EmptyState title="Plan your exams"
          text="Add an exam date and we will spread your revision over the days before it."
          action={<Button onClick={() => setAdding(true)}>Add your first exam</Button>} />
      ) : (
        <>
          <Section title="Exams">
            <Stack gap={4}>{upcoming.map((e) => (
              <ExamCard key={e.id} exam={e} today={today} onRemove={(id) => update({ exams: state.exams.filter((x) => x.id !== id) })} />
            ))}</Stack>
          </Section>

          <Section title={tr('plan.today')}>
            <Card className="shadow-glow">
              <div className="flex items-center gap-5">
                <Ring ratio={prog.ratio} label={`${prog.done}/${prog.total}`} />
                <p className="text-base text-ink-2">
                  {!todayDay?.tasks.length ? 'Nothing planned today. Enjoy the break.'
                    : prog.total > 0 && prog.done === prog.total ? 'All done for today. Well done!'
                    : 'A little each day adds up. Start with whatever feels easiest.'}
                </p>
              </div>
              {!!todayDay?.tasks.length && (
                <ul className="mt-4 divide-y divide-line">
                  {todayDay.tasks.map((x) => <TaskRow key={x.id} task={x} done={state.done.includes(x.id)} onToggle={toggle} />)}
                </ul>
              )}
            </Card>
          </Section>

          <Section title={tr('plan.week')}>
            <WeekView days={plan} selected={selected} onSelect={setPicked} doneIds={state.done} today={today} />
            {day && day.day !== today && (
              <Card className="mt-4">
                {day.exams.length ? <p className="text-base text-ink">Exam day: {day.exams.map((e) => e.name).join(', ')}. You are ready.</p>
                  : !day.tasks.length ? <p className="text-base text-muted">{day.off ? 'A day off.' : 'Nothing planned.'}</p>
                  : <ul className="divide-y divide-line">{day.tasks.map((t) => <TaskRow key={t.id} task={t} done={state.done.includes(t.id)} onToggle={toggle} />)}</ul>}
              </Card>
            )}
          </Section>
          <p className="text-sm text-muted">Missed a day? No problem. The plan always starts again from today.</p>
        </>
      )}
      <ExamSheet open={adding} onClose={() => setAdding(false)} today={today} onAdd={addExam} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} state={state} onChange={update} />
    </>
  );
}
