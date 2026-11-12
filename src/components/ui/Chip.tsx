import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { selected?: boolean }

export function Chip({ selected, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-[36px] items-center rounded-full border px-3.5 text-sm font-medium transition',
        selected ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface text-muted hover:text-ink',
        className,
      )}
      {...rest}
    />
  );
}
