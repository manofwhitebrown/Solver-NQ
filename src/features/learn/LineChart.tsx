// Tiny SVG line chart for values in 0..1. null values leave a gap in the line.
export function LineChart({ data, label }: { data: Array<{ label: string; value: number | null }>; label: string }) {
  const W = 320, H = 120, pad = 18, step = (W - pad * 2) / Math.max(1, data.length - 1);
  const y = (v: number) => H - v * (H - 16);
  const segments: string[] = [];
  let cur = '';
  data.forEach((d, i) => {
    if (d.value === null) { if (cur) segments.push(cur); cur = ''; return; }
    cur += `${cur ? 'L' : 'M'}${pad + i * step},${y(d.value)} `;
  });
  if (cur) segments.push(cur);
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label={label}>
      {[0, 0.5, 1].map((g) => <line key={g} x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} className="stroke-line" strokeDasharray={g === 0 ? undefined : '3 4'} />)}
      {segments.map((d, i) => <path key={i} d={d} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="stroke-accent" />)}
      {data.map((d, i) => d.value !== null && <circle key={i} cx={pad + i * step} cy={y(d.value)} r={3} className="fill-accent" />)}
      {data.map((d, i) => (i % 2 === 0) && <text key={i} x={pad + i * step} y={H + 13} textAnchor="middle" className="fill-muted" fontSize="9">{d.label}</text>)}
    </svg>
  );
}
