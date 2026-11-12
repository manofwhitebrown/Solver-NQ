import type { HTMLAttributes } from 'react';
import { cn } from './cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** wide = lists/dashboards (64rem); default = reading pages (44rem). */
  wide?: boolean;
}

/** The only owner of page gutters. Layout provides the single <main>; screens render <Page>. */
export function Page({ wide, className, style, ...rest }: Props) {
  return (
    <div
      className={cn(
        'mx-auto w-full pt-6 lg:pt-10 [@media(max-height:499px)]:pt-3',
        'pl-[max(1.25rem,var(--sal))] pr-[max(1.25rem,var(--sar))]',
        'md:pl-[max(1.75rem,var(--sal))] md:pr-[max(1.75rem,var(--sar))]',
        'lg:pl-[max(2.5rem,var(--sal))] lg:pr-[max(2.5rem,var(--sar))]',
        wide ? 'max-w-wide' : 'max-w-read',
        className,
      )}
      style={{ paddingBottom: 'calc(var(--page-bottom, var(--tabbar-h)) + var(--sab) + 2rem)', ...style }}
      {...rest}
    />
  );
}
