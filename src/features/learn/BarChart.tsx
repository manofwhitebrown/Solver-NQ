// Tiny SVG bar chart. Labels are short strings (e.g. day numbers).
export function BarChart({ data, label }: { data: Array<{ label: string; value: number }>; label: string }) {
  const W = 320, H = 120, pad = 18, max = Math.max(1, ...data.map((d) => d.value));
  const slot = (W - pad * 2) / Math.max(1, data.length), bw = Math.max(4, slot * 0.6);
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label={label}>
      <line x1={pad} x2={W - pad} y1={H} y2={H} className="stroke-line" />
      {data.map((d, i) => {
        const h = (d.value / max) * (H - 16), x = pad + i * slot + (slot - bw) / 2;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={h} rx={3} className="fill-accent" opacity={d.value ? 1 : 0.15} />
            {d.value > 0 && <text x={x + bw / 2} y={H - h - 4} textAnchor="middle" className="fill-muted" fontSize="12">{d.value}</text>}
            {(i % 3 === 0) && <text x={x + bw / 2} y={H + 17} textAnchor="middle" className="fill-muted" fontSize="12">{d.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}
