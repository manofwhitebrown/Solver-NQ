import { PageHeader, Section, Stack, Chip, Cluster, Card, Button, SubjectTile } from '@/components/ui';
import type { Subject } from '@/types';
import { updateSettings, useSettings } from '@/lib/settings';
import { Components } from './Components';
import { Swatches } from './Swatches';

const SIZES = [['caption 13', 'text-caption'], ['sm 14', 'text-sm'], ['base 16', 'text-base'], ['read 17', 'text-read'], ['lg 18', 'text-lg'], ['xl 22', 'text-xl'], ['2xl 28', 'text-2xl'], ['3xl 30', 'text-3xl']];
const SUBJECTS: Subject[] = ['math', 'physics', 'chemistry', 'biology', 'coding', 'languages', 'history', 'commerce', 'other'];
const SPACES = [4, 8, 12, 16, 20, 24, 32, 40, 48];

export default function DesignGallery() {
  const { theme } = useSettings();
  return (
    <>
      <PageHeader title="Design gallery" subtitle="Tokens, type, spacing and components" actions={
        <Cluster>{(['light', 'dark'] as const).map((t) => <Chip key={t} selected={theme === t} onClick={() => updateSettings({ theme: t })}>{t}</Chip>)}</Cluster>
      } />
      <Section title="Colours and live contrast"><Swatches theme={theme} /></Section>
      <Section title="Brand">
        <Card><Stack gap={4}>
          <div className="brand-grad h-16 rounded-lg shadow-glow" aria-label="Brand gradient" role="img" />
          <Cluster gap={3}><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button></Cluster>
          <Cluster gap={3}>{SUBJECTS.map((s) => <SubjectTile key={s} subject={s} />)}</Cluster>
        </Stack></Card>
      </Section>
      <Section title="Type scale">
        <Card><Stack gap={2}>{SIZES.map(([n, c]) => <p key={n} className={c}>{n} · The quick brown fox</p>)}</Stack></Card>
      </Section>
      <Section title="Spacing (4 px grid)">
        <Card><Stack gap={2}>{SPACES.map((s) => (
          <div key={s} className="flex items-center gap-3 text-sm"><span className="w-10 text-muted">{s}</span><span className="h-3 rounded-sm bg-accent" style={{ width: s * 4 }} /></div>
        ))}</Stack></Card>
      </Section>
      <Section title="Elevation">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((n) => <div key={n} className={`elev-${n} rounded-lg p-5 text-center text-sm font-semibold`}>elev-{n}</div>)}</div>
      </Section>
      <Section title="Components"><Components /></Section>
    </>
  );
}
