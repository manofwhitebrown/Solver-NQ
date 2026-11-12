import type { ReactNode } from 'react';

/** Label + control + optional hint, wired with a shared id. */
export function Field({ label, htmlFor, hint, children }: {
  label: string; htmlFor: string; hint?: string; children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

export const controlClass =
  'w-full min-h-[44px] rounded-md border border-line bg-surface px-3.5 text-[16px] text-ink ' +
  'placeholder:text-muted/70 transition focus:border-accent focus:outline-none ' +
  'focus:ring-2 focus:ring-accent/30 disabled:opacity-50';
