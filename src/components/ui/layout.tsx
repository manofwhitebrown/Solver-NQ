import type { HTMLAttributes } from 'react';
import { cn } from './cn';

const GAP = { 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12' } as const;
export type Gap = keyof typeof GAP;

/** Vertical rhythm. Default gap 4 = 16 px (between cards). */
export function Stack({ gap = 4, className, ...rest }: HTMLAttributes<HTMLDivElement> & { gap?: Gap }) {
  return <div className={cn('flex flex-col', GAP[gap], className)} {...rest} />;
}

/** Wrapping horizontal row. Default gap 2 = 8 px. */
export function Cluster({ gap = 2, className, ...rest }: HTMLAttributes<HTMLDivElement> & { gap?: Gap }) {
  return <div className={cn('flex flex-wrap items-center', GAP[gap], className)} {...rest} />;
}

/** A page section: 32 px rhythm between sections, optional heading. */
export function Section({ title, className, children, ...rest }: HTMLAttributes<HTMLElement> & { title?: string }) {
  return (
    <section className={cn('mb-8 last:mb-0', className)} {...rest}>
      {title && <h2 className="mb-3 text-xl font-semibold text-ink">{title}</h2>}
      {children}
    </section>
  );
}

/** Row of controls (search + filters + actions). */
export function Toolbar({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...rest} />;
}
