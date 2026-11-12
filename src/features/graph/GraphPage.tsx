import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Cluster, IconButton, Input, PageHeader, Stack } from '@/components/ui';
import { GraphCanvas } from './GraphCanvas';
import { COLORS, DASHES, DEFAULT_VIEW, compileFn, findMarks, viewBounds, type Fn, type View } from './plot';

const MAX_FNS = 5;

export function GraphPage() {
  const [params] = useSearchParams();
  const [texts, setTexts] = useState<string[]>(() => {
    const given = params.getAll('f').filter(Boolean).slice(0, MAX_FNS);
    return given.length ? given : ['x^2 - 4'];
  });
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [showMarks, setShowMarks] = useState(true);
  const [size] = useState({ w: 1200, h: 800 }); // generous bound for the zeros search (canvas may be wider than a phone)

  const compiled = useMemo(() => texts.map((t) => compileFn(t)), [texts]);
  const fns = compiled.map((c) => ('fn' in c ? c.fn : null));
  const marks = useMemo(() => {
    if (!showMarks) return [];
    const b = viewBounds(view, size.w, size.h);
    return findMarks(fns.filter((f): f is Fn => f !== null), b.xmin, b.xmax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fns.map(String).join('|'), view, showMarks, size]);

  const setText = (i: number, v: string) => setTexts((t) => t.map((x, k) => (k === i ? v : x)));

  return (
    <>
      <PageHeader title="Graph" subtitle="Type a function of x. Drag to pan, pinch or scroll to zoom." />
      <Stack gap={6}>
        <Stack gap={3}>
          {texts.map((t, i) => {
            const c = compiled[i];
            return (
              <div key={i}>
                <div className="flex items-center gap-3">
                  <Legend i={i} />
                  <Input value={t} onChange={(e) => setText(i, e.target.value)} placeholder="f(x) = sin(x)"
                    aria-label={`Function ${i + 1}`} aria-invalid={'error' in c} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
                  {texts.length > 1 && (
                    <IconButton label="Remove function" className="shrink-0 text-xl" onClick={() => setTexts((x) => x.filter((_, k) => k !== i))}>×</IconButton>)}
                </div>
                {'error' in c && <p className="ml-[3.75rem] mt-1 text-sm text-bad">{c.error}</p>}
              </div>
            );
          })}
        </Stack>
        <Cluster gap={3}>
          {texts.length < MAX_FNS && <Button variant="secondary" onClick={() => setTexts((t) => [...t, ''])}>Add function</Button>}
          <Button variant="ghost" onClick={() => setView(DEFAULT_VIEW)}>Reset view</Button>
        </Cluster>
        <label className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-md border border-line bg-surface px-4 text-base">
          <input type="checkbox" checked={showMarks} onChange={(e) => setShowMarks(e.target.checked)} className="h-5 w-5 accent-[rgb(var(--accent))]" />
          Zeros and intersections
        </label>
        <div className="h-[55dvh] min-h-[320px] lg:h-[520px]"><GraphCanvas fns={fns} view={view} onView={setView} marks={marks} /></div>
        <p className="text-sm text-ink-2">Hollow dots are zeros, solid dots are intersections.</p>
      </Stack>
    </>
  );
}

/** Line sample with the same colour and dash as the plotted curve. */
function Legend({ i }: { i: number }) {
  return (
    <svg width="36" height="12" className="shrink-0" aria-hidden>
      <line x1="1" x2="35" y1="6" y2="6" stroke={COLORS[i % COLORS.length]} strokeWidth="3" strokeLinecap="round" strokeDasharray={DASHES[i % DASHES.length] || undefined} />
    </svg>
  );
}
