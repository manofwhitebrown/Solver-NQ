/** Small progress ring: how much of today is done. */
export function Ring({ ratio, label, size = 88 }: { ratio: number; label: string; size?: number }) {
  const stroke = 8, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Today: ${label}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          className="stroke-accent transition-[stroke-dashoffset] duration-500"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, ratio)))} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-ink">{label}</span>
    </div>
  );
}
