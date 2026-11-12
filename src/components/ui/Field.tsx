import type { ReactNode } from 'react';

/** Label + control + optional hint, wired with a shared id. */
export function Field({ label, htmlFor, hint, children }: {
  label: string; htmlFor: string; hint?: string; children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-2">{label}</label>
      {children}
      {hint && <p className="text-caption text-muted">{hint}</p>}
    </div>
  );
}

export const controlClass =
  'w-full min-h-[48px] rounded-md border border-line-strong bg-raised px-4 text-base text-ink ' +
  'placeholder:text-muted transition focus:border-accent focus:outline-none ' +
  'focus:ring-[3px] focus:ring-accent/35 disabled:border-line disabled:bg-disabled-bg disabled:text-disabled-ink';
