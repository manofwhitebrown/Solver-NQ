import { useId } from 'react';

/** Progress ring in the brand gradient: how much of today is done. Moves without animation if the user asked for less motion. */
export function Ring({ ratio, label, size = 96 }: { ratio: number; label: string; size?: number }) {
  const id = useId();
  const stroke = 10, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Today: ${label}`}>
      <svg width={size} height={size} className="-rotate-90 rtl:-scale-x-100" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'rgb(var(--accent))' }} />
            <stop offset="100%" style={{ stopColor: 'rgb(var(--accent-2))' }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        {clamped > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" stroke={`url(#${id})`}
            className="transition-[stroke-dashoffset] duration-500 ease-out motion-reduce:transition-none"
            strokeDasharray={c} strokeDashoffset={c * (1 - clamped)} />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-ink">{label}</span>
    </div>
  );
}
