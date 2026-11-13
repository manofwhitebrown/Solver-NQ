import { useEffect, useState } from 'react';
import { Card, Stack } from '@/components/ui';
import { ratio, readVar } from './contrast';

const SURFACES = ['bg', 'surface', 'raised', 'overlay'];
const TEXT = ['ink', 'ink-2', 'muted', 'accent', 'ok', 'warn', 'bad'];
const ALL = [...SURFACES, 'line', 'line-strong', ...TEXT, 'accent-2', 'accent-soft', 'ok-soft', 'warn-soft', 'bad-soft', 'disabled-bg', 'disabled-ink'];

export function Swatches({ theme }: { theme: string }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setTimeout(() => tick((n) => n + 1), 60); return () => clearTimeout(t); }, [theme]); // wait for data-theme
  return (
    <Stack gap={4}>
      <Card>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
          {ALL.map((n) => (
            <div key={n} className="text-caption">
              <div className="h-12 rounded-md border border-line-strong" style={{ background: `rgb(var(--${n}))` }} />
              <div className="mt-1 font-semibold text-ink">{n}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted"><th className="pb-2 pr-3">text</th>{SURFACES.map((s) => <th key={s} className="pb-2 pr-3">on {s}</th>)}</tr></thead>
          <tbody>
            {TEXT.map((t) => (
              <tr key={t} className="border-t border-line">
                <td className="py-2 pr-3 font-semibold" style={{ color: `rgb(var(--${t}))` }}>{t}</td>
                {SURFACES.map((s) => {
                  const r = ratio(readVar(t), readVar(s));
                  return <td key={s} className={r >= 4.5 ? 'py-2 pr-3 text-ok' : 'py-2 pr-3 font-bold text-bad'}>{r.toFixed(2)}</td>;
                })}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="py-2 pr-3 font-semibold">line-strong</td>
              {SURFACES.map((s) => <td key={s} className="py-2 pr-3 text-ok">{ratio(readVar('line-strong'), readVar(s)).toFixed(2)}</td>)}
            </tr>
          </tbody>
        </table>
      </Card>
    </Stack>
  );
}
