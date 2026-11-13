import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Main content. Always first in the DOM, so phones and screen readers read it first. */
  primary: ReactNode;
  /** Side content (follow-up chat, details, preview). Below 768 px it stacks under `primary`. */
  secondary: ReactNode;
  /** Accessible names for the two panes (they are regions, not a second <main>). */
  primaryLabel: string;
  secondaryLabel: string;
  /** Side pane width from 768 px up: sm 18 rem, md 22 rem (default), never more than 40% of the row (large text). */
  secondaryWidth?: 'sm' | 'md';
  /** Keep the side pane in view while the main pane scrolls (default true). */
  stickySecondary?: boolean;
}

const WIDTH = { sm: 'md:grid-cols-[minmax(0,1fr)_minmax(0,min(18rem,40%))]', md: 'md:grid-cols-[minmax(0,1fr)_minmax(0,min(22rem,40%))]' } as const;

/**
 * Tablet two-pane layout. Under 768 px it is exactly a vertical stack (phones are unchanged);
 * from 768 px it is main + side pane. Panes never create a second <main> or sideways scroll
 * (`min-w-0`); a very wide child must scroll inside its own box. Put it inside <Page wide>.
 */
export function TwoPane({
  primary, secondary, primaryLabel, secondaryLabel, secondaryWidth = 'md', stickySecondary = true, className, ...rest
}: Props) {
  return (
    <div className={cn('grid grid-cols-1 gap-6 md:items-start md:gap-8', WIDTH[secondaryWidth], className)} {...rest}>
      <section aria-label={primaryLabel} className="min-w-0">{primary}</section>
      <aside
        aria-label={secondaryLabel}
        className={cn('min-w-0', stickySecondary && 'md:sticky md:top-6 md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto')}
      >
        {secondary}
      </aside>
    </div>
  );
}
