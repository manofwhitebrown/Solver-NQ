import { useRef, useState } from 'react';
import { dragRect, type Handle, type Rect } from './cropMath';

interface Props { url: string; rect: Rect; onChange: (r: Rect) => void }
const HANDLES: Array<[Handle, string]> = [
  ['nw', 'left-0 top-0 -translate-x-1/2 -translate-y-1/2'], ['ne', 'right-0 top-0 translate-x-1/2 -translate-y-1/2'],
  ['sw', 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2'], ['se', 'right-0 bottom-0 translate-x-1/2 translate-y-1/2'],
];

// Crop box with drag handles; pinch (or Ctrl+wheel) zooms, the area scrolls when zoomed.
export function CropEditor({ url, rect, onChange }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; z: number } | null>(null);

  const startDrag = (handle: Handle) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const el = box.current!;
    el.setPointerCapture?.(e.pointerId);
    let last = { x: e.clientX, y: e.clientY };
    let cur = rect;
    const move = (ev: PointerEvent) => {
      const b = el.getBoundingClientRect();
      cur = dragRect(cur, handle, (ev.clientX - last.x) / b.width, (ev.clientY - last.y) / b.height);
      last = { x: ev.clientX, y: ev.clientY };
      onChange(cur);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onPointerDown = (e: React.PointerEvent) => touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const onPointerMove = (e: React.PointerEvent) => {
    const t = touches.current;
    if (!t.has(e.pointerId)) return;
    t.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (t.size !== 2) return;
    const [a, b] = [...t.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (!pinch.current) pinch.current = { d, z: zoom };
    else setZoom(Math.min(4, Math.max(1, (pinch.current.z * d) / pinch.current.d)));
  };
  const endPointer = (e: React.PointerEvent) => { touches.current.delete(e.pointerId); pinch.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) setZoom(z => Math.min(4, Math.max(1, z - e.deltaY * 0.01)));
  };

  return (
    <div className="max-h-[max(9rem,calc(100svh-14rem))] [@media(max-height:500px)]:max-h-[max(7rem,calc(100svh-11rem))] overflow-auto rounded-lg border border-line bg-raised"
      style={{ touchAction: zoom > 1 ? 'pan-x pan-y' : 'pan-y' }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer}
      onPointerCancel={endPointer} onWheel={onWheel}>
      <div ref={box} className="relative mx-auto select-none" style={{ width: `${zoom * 100}%` }}>
        <img src={url} alt="Your photo, ready to crop" className="block w-full" draggable={false} />
        <div className="absolute inset-0 bg-black/40" style={{
          clipPath: `polygon(0 0,100% 0,100% 100%,0 100%,0 0,${rect.x * 100}% ${rect.y * 100}%,${rect.x * 100}% ${(rect.y + rect.h) * 100}%,${(rect.x + rect.w) * 100}% ${(rect.y + rect.h) * 100}%,${(rect.x + rect.w) * 100}% ${rect.y * 100}%,${rect.x * 100}% ${rect.y * 100}%)`,
        }} />
        <div role="group" aria-label="Crop area" onPointerDown={startDrag('move')}
          className="absolute cursor-move border-2 border-accent"
          style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${rect.h * 100}%`, touchAction: 'none' }}>
          {HANDLES.map(([h, pos]) => (
            <span key={h} onPointerDown={startDrag(h)} aria-label={`Resize ${h}`}
              className={`absolute flex h-12 w-12 items-center justify-center ${pos}`} style={{ touchAction: 'none' }}>
              <span className="h-5 w-5 rounded-full border-2 border-accent bg-surface" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
