import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ActionBar, Button, Chip, Cluster, EmptyState, PageHeader, Section, Spinner, Stack, toast } from '@/components/ui';
import { listLibrary } from '@/lib/db';
import { useT } from '@/lib/i18n';
import {
  buildExport, defaultOptions, loadItems,
  type BuildResult, type ExportFormat, type ResolvedOptions, type StudyPackFilter,
} from '@/lib/export';
import { filterItems } from '@/lib/export/pack';
import type { ExportItem } from '@/lib/export/markdown';
import { OptionsSheet } from './OptionsSheet';
import { ResultCard } from './ResultCard';
import { FORMATS } from './subjects';

const Preview = lazy(() => import('./Preview'));

export default function ExportPage() {
  const { t } = useT();
  const [params] = useSearchParams();
  const ids = useMemo(() => (params.get('ids') ?? '').split(',').filter(Boolean), [params]);
  const isPack = ids.length === 0;

  const [format, setFormat] = useState<Exclude<ExportFormat, 'pack'>>('pdf');
  const [opts, setOpts] = useState<ResolvedOptions>(defaultOptions);
  const [filter, setFilter] = useState<StudyPackFilter>({});
  const [items, setItems] = useState<ExportItem[] | null>(null);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<[number, number]>([0, 1]);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [error, setError] = useState('');
  const [warn, setWarn] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []); // leaving the page stops the work

  useEffect(() => {
    let live = true;
    setItems(null);
    setResult(null);
    const load = isPack ? listLibrary({}).then((all) => filterItems(all, filter)) : loadItems(ids);
    load.then((x) => live && setItems(x)).catch((e) => live && (setError(String(e?.message ?? e)), setItems([])));
    return () => { live = false; };
  }, [ids, isPack, filter]);

  async function run() {
    setBusy(true); setError(''); setWarn(0); setResult(null); setProgress([0, 1]);
    const ctl = new AbortController();
    abortRef.current = ctl;
    try {
      const r = await buildExport({
        format: isPack ? 'pack' : format, ids, filter, config: opts,
        onProgress: (d, t) => setProgress([d, t]), signal: ctl.signal, onWarn: setWarn,
      });
      setResult(r);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') toast('Export cancelled');
      else setError(e instanceof Error ? e.message : 'Export failed');
    } finally { setBusy(false); }
  }

  if (items && !items.length && !isPack) {
    return (
      <>
        <h1 className="sr-only">{t('export.title')}</h1>
        <EmptyState title={t('export.nothingTitle')} text={t('export.nothingText')}
          action={<Link to="/library" className="inline-flex"><Button>Open library</Button></Link>} />
      </>
    );
  }

  const pct = Math.round((progress[0] / Math.max(1, progress[1])) * 100);
  const isPdf = format === 'pdf';

  const count = items === null ? 'Loading…' : items.length === 1 ? t('export.countOne') : t('export.count', { n: items.length });
  return (
    <>
      <div data-no-print>
        <PageHeader title={isPack ? t('export.studyPack') : t('export.title')} subtitle={`${count}${isPack ? ' · cover, contents, answers' : ''} · works offline`}
          actions={<Button variant="secondary" size="md" onClick={() => setSheet(true)}>{t('export.options')}</Button>} />
        {!isPack && (
          <Cluster className="mb-8" role="group" aria-label="Format">
            {FORMATS.map((f) => (
              <Chip key={f.value} selected={format === f.value} onClick={() => { setFormat(f.value); setResult(null); }}>{f.label}</Chip>
            ))}
          </Cluster>
        )}
      </div>

      <Section title={t('export.preview')}>
        {items === null ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : items.length === 0 ? (
          <p data-no-print className="py-10 text-center text-base text-muted">No answers match these filters.</p>
        ) : (
          <Suspense fallback={<div className="flex justify-center py-10"><Spinner /></div>}>
            <Preview items={items} opts={opts} />
          </Suspense>
        )}
      </Section>

      <div data-no-print>
        <Stack gap={4}>
          {busy && (
            <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>
              <p className="text-sm text-muted">Building… {pct}%</p>
            </div>
          )}
          {warn > 0 && <p className="text-base text-muted">{warn} part{warn > 1 ? 's' : ''} could not be drawn and {warn > 1 ? 'were' : 'was'} replaced by a note.</p>}
          {error && <p role="alert" className="text-base text-bad">{error}</p>}
          {result && <ResultCard result={result} onShareError={(m) => toast(m, 'error')} />}
        </Stack>

        <ActionBar>
          <Button block loading={busy} disabled={!items?.length} onClick={run}>
            {isPack ? t('export.buildPack') : t('export.build', { format: FORMATS.find((f) => f.value === format)?.label ?? '' })}
          </Button>
          {busy && <Button variant="secondary" onClick={() => abortRef.current?.abort()}>Cancel</Button>}
          <Button variant="secondary" className="hidden lg:inline-flex" disabled={!items?.length} onClick={() => window.print()}>Print</Button>
        </ActionBar>
      </div>

      <OptionsSheet open={sheet} onClose={() => setSheet(false)} isPack={isPack} isPdf={isPdf} isDocx={format === 'docx'}
        opts={opts} setOpts={setOpts} filter={filter} setFilter={setFilter} />
      <div aria-hidden data-no-print className="h-20" /> {/* room for the Export bar; the route's Page already clears the tab bar */}
    </>
  );
}
