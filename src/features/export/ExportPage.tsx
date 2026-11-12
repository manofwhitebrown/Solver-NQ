import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ActionBar, Button, Chip, EmptyState, Spinner, toast } from '@/components/ui';
import { listLibrary } from '@/lib/db';
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

  useEffect(() => {
    let live = true;
    setItems(null);
    setResult(null);
    const load = isPack ? listLibrary({}).then((all) => filterItems(all, filter)) : loadItems(ids);
    load.then((x) => live && setItems(x)).catch((e) => live && (setError(String(e?.message ?? e)), setItems([])));
    return () => { live = false; };
  }, [ids, isPack, filter]);

  async function run() {
    setBusy(true); setError(''); setResult(null); setProgress([0, 1]);
    try {
      const r = await buildExport({
        format: isPack ? 'pack' : format, ids, filter, config: opts,
        onProgress: (d, t) => setProgress([d, t]),
      });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally { setBusy(false); }
  }

  if (items && !items.length && !isPack) {
    return <EmptyState title="Nothing to export" text="Pick answers in your library, then choose Export."
      action={<Link to="/library"><Button>Open library</Button></Link>} />;
  }

  const pct = Math.round((progress[0] / Math.max(1, progress[1])) * 100);
  const isPdf = format === 'pdf';

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 pb-40 pt-5">
      <div data-no-print className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{isPack ? 'Study pack' : 'Export'}</h1>
          <p className="text-[15px] text-muted">
            {items === null ? 'Loading…' : `${items.length} answer${items.length === 1 ? '' : 's'}`}
            {isPack ? ' · cover, contents, answers' : ''} · works offline
          </p>
        </div>

        {!isPack && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Format">
            {FORMATS.map((f) => (
              <Chip key={f.value} selected={format === f.value} onClick={() => { setFormat(f.value); setResult(null); }}>{f.label}</Chip>
            ))}
          </div>
        )}
        <Button variant="secondary" onClick={() => setSheet(true)}>Options</Button>
      </div>

      {items === null ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : items.length === 0 ? (
        <p data-no-print className="py-10 text-center text-muted">No answers match these filters.</p>
      ) : (
        <Suspense fallback={<div className="flex justify-center py-10"><Spinner /></div>}>
          <Preview items={items} opts={opts} />
        </Suspense>
      )}

      <div data-no-print className="space-y-3">
        {busy && (
          <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>
            <p className="text-[13px] text-muted">Building… {pct}%</p>
          </div>
        )}
        {error && <p role="alert" className="text-[15px] text-bad">{error}</p>}
        {result && <ResultCard result={result} onShareError={(m) => toast(m, 'error')} />}
      </div>

      <div data-no-print>
        <ActionBar>
          <Button block loading={busy} disabled={!items?.length} onClick={run}>
            {isPack ? 'Build study pack' : `Export ${FORMATS.find((f) => f.value === format)?.label}`}
          </Button>
          <Button variant="secondary" className="hidden lg:inline-flex" disabled={!items?.length} onClick={() => window.print()}>Print</Button>
        </ActionBar>
      </div>

      <OptionsSheet open={sheet} onClose={() => setSheet(false)} isPack={isPack} isPdf={isPdf} isDocx={format === 'docx'}
        opts={opts} setOpts={setOpts} filter={filter} setFilter={setFilter} />
    </div>
  );
}
