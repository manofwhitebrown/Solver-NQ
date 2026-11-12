import { Link } from 'react-router-dom';

/**
 * Placeholder for AI-4's ScanButton. When `ScanButton` exists in '@/features/scan',
 * replace this file's body with it (this is the only place to change).
 */
export function ScanSlot() {
  return (
    <Link
      to="/scan"
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-line bg-surface px-5 text-[15px] font-semibold text-ink transition hover:bg-raised active:scale-[.98]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16" />
      </svg>
      Scan
    </Link>
  );
}
