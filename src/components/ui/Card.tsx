import type { HTMLAttributes } from 'react';
import { cn } from './cn';

interface Props extends HTMLAttributes<HTMLDivElement> { interactive?: boolean }

/** Surface + 1 px line + soft shadow (dark: lighter surface). Padding 20 phone / 24 laptop. */
export function Card({ interactive, className, ...rest }: Props) {
  return (
    <div
      className={cn(
        'elev-1 rounded-xl p-5 lg:p-7',
        interactive && 'cursor-pointer transition hover:elev-2 hover:-translate-y-0.5 hover:border-line-strong active:scale-[.995]',
        className,
      )}
      {...rest}
    />
  );
}
