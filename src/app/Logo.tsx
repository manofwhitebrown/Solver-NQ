/** Wordmark: a rounded accent tile with a check-stroke "solved" mark, plus the name. */
export function Logo() {
  return (
    <div className="flex items-center gap-3 px-3">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-accent" />
        <path d="M9 16.5l4.5 4.5L23 11" fill="none" className="stroke-accent-ink" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-ink">Solver-NQ</span>
    </div>
  );
}
