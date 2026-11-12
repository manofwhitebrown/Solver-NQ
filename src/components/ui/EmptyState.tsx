import type { ReactNode } from 'react';

function DefaultArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden>
      <rect x="10" y="14" width="44" height="36" rx="8" className="fill-raised stroke-line-strong" strokeWidth="2" />
      <path d="M20 28h24M20 36h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="49" cy="46" r="9" className="fill-accent-soft stroke-accent" strokeWidth="2" />
      <path d="m45.5 46 2.5 2.5 4.5-5" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyState({ title, text, action, icon }: {
  title: string; text?: string; action?: ReactNode; icon?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="text-muted">{icon ?? <DefaultArt />}</div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {text && <p className="text-base text-muted">{text}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
