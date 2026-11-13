import './graph.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconButton } from '@/components/ui';
import { COLORS, DASHES, formatTick, niceStep, samplePath, viewBounds, zoomAt, type Fn, type Mark, type View } from './plot';

interface Props { fns: Array<Fn | null>; view: View; onView: (v: View) => void; marks: Mark[] }

/** SVG plot area: drag to pan, wheel or pinch to zoom. */
export function GraphCanvas({ fns, view, onView, marks }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 320, h: 360 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const { w, h } = size;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const sx = (x: number) => w / 2 + (x - view.cx) * view.scale;
  const sy = (y: number) => h / 2 - (y - view.cy) * view.scale;
  const b = viewBounds(view, w, h);
  const step = niceStep(view.scale);
  const ticks = (min: number, max: number) => {
    const out: number[] = [];
    for (let t = Math.ceil(min / step) * step; t <= max; t += step) out.push(+t.toFixed(10));
    return out;
  };
  const axisX = Math.min(h - 18, Math.max(14, sy(0)));
  const axisY = Math.min(w - 30, Math.max(4, sx(0)));
  const paths = useMemo(
    () => fns.map((f) => (f ? samplePath(f, view, w, h).map((seg) => 'M' + seg.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')).join('') : '')),
    [fns, view, w, h],
  );

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const others = [...pointers.current.entries()].filter(([id]) => id !== e.pointerId).map(([, p]) => p);
    const next = { x: e.clientX, y: e.clientY };
    if (others.length === 0) {
      onView({ ...view, cx: view.cx - (next.x - prev.x) / view.scale, cy: view.cy + (next.y - prev.y) / view.scale });
    } else {
      const o = others[0];
      const factor = Math.hypot(next.x - o.x, next.y - o.y) / (Math.hypot(prev.x - o.x, prev.y - o.y) || 1);
      const r = ref.current!.getBoundingClientRect();
      onView(zoomAt(view, factor, (next.x + o.x) / 2 - r.left, (next.y + o.y) / 2 - r.top, w, h));
    }
    pointers.current.set(e.pointerId, next);
  };
  const zoomBy = (f: number) => onView(zoomAt(view, f, w / 2, h / 2, w, h));
  const stop = (e: React.PointerEvent) => e.stopPropagation(); // buttons must not start a pan
  const onUp = (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); };
  const onWheel = (e: React.WheelEvent) => {
    const r = ref.current!.getBoundingClientRect();
    onView(zoomAt(view, Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top, w, h));
  };

  return (
    <div ref={ref} className="relative h-full min-h-[320px] w-full select-none overflow-hidden rounded-xl bg-surface"
      style={{ touchAction: 'none' }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      onPointerCancel={onUp} onWheel={onWheel}>
      <svg width={w} height={h} role="img" aria-label="Function graph">
        {ticks(b.xmin, b.xmax).map((t) => <line key={`gx${t}`} x1={sx(t)} x2={sx(t)} y1={0} y2={h} stroke="rgb(var(--line))" strokeWidth={1} />)}
        {ticks(b.ymin, b.ymax).map((t) => <line key={`gy${t}`} y1={sy(t)} y2={sy(t)} x1={0} x2={w} stroke="rgb(var(--line))" strokeWidth={1} />)}
        <line x1={0} x2={w} y1={sy(0)} y2={sy(0)} stroke="rgb(var(--muted))" strokeWidth={1.5} />
        <line y1={0} y2={h} x1={sx(0)} x2={sx(0)} stroke="rgb(var(--muted))" strokeWidth={1.5} />
        {ticks(b.xmin, b.xmax).filter((t) => t !== 0).map((t) => (
          <text key={`tx${t}`} x={sx(t)} y={axisX + 14} textAnchor="middle" fontSize={12} fill="rgb(var(--ink-2))">{formatTick(t)}</text>))}
        {ticks(b.ymin, b.ymax).filter((t) => t !== 0).map((t) => (
          <text key={`ty${t}`} x={axisY + 4} y={sy(t) - 3} fontSize={12} fill="rgb(var(--ink-2))">{formatTick(t)}</text>))}
        {paths.map((d, i) => d && <path key={i} d={d} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={DASHES[i % DASHES.length] || undefined} />)}
        {marks.map((m, i) => (
          <circle key={i} cx={sx(m.x)} cy={sy(m.y)} r={5} fill={m.kind === 'zero' ? 'rgb(var(--surface))' : 'rgb(var(--ink))'}
            stroke="rgb(var(--ink))" strokeWidth={2}><title>{`(${formatTick(+m.x.toPrecision(6))}, ${formatTick(+m.y.toPrecision(6))})`}</title></circle>))}
      </svg>
      <div className="absolute bottom-3 right-3 flex flex-col gap-2" onPointerDown={stop} onPointerMove={stop} onWheel={(e) => e.stopPropagation()}>
        <IconButton label="Zoom in" className="elev-2 bg-surface text-xl" onClick={() => zoomBy(1.4)}>+</IconButton>
        <IconButton label="Zoom out" className="elev-2 bg-surface text-xl" onClick={() => zoomBy(1 / 1.4)}>−</IconButton>
      </div>
    </div>
  );
}
