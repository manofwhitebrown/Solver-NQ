import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // required: icon-only buttons need an accessible name
  children: ReactNode;
}

export function IconButton({ label, className, children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition',
        'hover:bg-raised active:scale-95 disabled:text-disabled-ink', className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
