import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, IconButton, Input } from '@/components/ui';
import { GraphCanvas } from './GraphCanvas';
import { COLORS, DEFAULT_VIEW, compileFn, findMarks, viewBounds, type Fn, type View } from './plot';

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
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 p-4 pb-6">
      <h1 className="text-xl font-semibold">Graph</h1>
      <div className="space-y-2">
        {texts.map((t, i) => {
          const c = compiled[i];
          return (
            <div key={i}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <Input value={t} onChange={(e) => setText(i, e.target.value)} placeholder="f(x) = sin(x)"
                  aria-label={`Function ${i + 1}`} aria-invalid={'error' in c} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
                {texts.length > 1 && (
                  <IconButton label="Remove function" onClick={() => setTexts((x) => x.filter((_, k) => k !== i))}>×</IconButton>)}
              </div>
              {'error' in c && <p className="ml-5 mt-1 text-[13px] text-bad">{c.error}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {texts.length < MAX_FNS && <Button variant="secondary" onClick={() => setTexts((t) => [...t, ''])}>Add function</Button>}
        <Button variant="ghost" onClick={() => setView(DEFAULT_VIEW)}>Reset view</Button>
        <label className="flex min-h-[44px] items-center gap-2 text-sm">
          <input type="checkbox" checked={showMarks} onChange={(e) => setShowMarks(e.target.checked)} className="h-5 w-5 accent-[rgb(var(--accent))]" />
          Zeros and intersections
        </label>
      </div>
      <div className="min-h-[300px] flex-1"><GraphCanvas fns={fns} view={view} onView={setView} marks={marks} /></div>
      <p className="text-[13px] text-muted">Drag to pan, pinch or scroll to zoom. Hollow dots are zeros, solid dots are intersections.</p>
    </div>
  );
}
