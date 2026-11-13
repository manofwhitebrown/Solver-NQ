import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { selected?: boolean }

export function Chip({ selected, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'relative inline-flex min-h-[36px] items-center rounded-full border px-4 text-sm font-semibold transition',
        'before:absolute before:-inset-y-1 before:inset-x-0 before:content-[""]', // >= 44 px tap area
        selected ? 'brand-grad border-transparent text-accent-ink shadow-glow' : 'border-line bg-surface text-ink-2 shadow-soft hover:border-line-strong',
        className,
      )}
      {...rest}
    />
  );
}
