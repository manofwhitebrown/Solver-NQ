import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink shadow-soft hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface text-ink border border-line hover:bg-raised',
  ghost: 'text-ink hover:bg-raised',
  danger: 'bg-bad text-white hover:brightness-110',
};

export function Button({
  variant = 'primary', loading, block, className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold',
        'transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-[.98]',
        variants[variant], block && 'w-full', className,
      )}
      {...rest}
    >
      {loading && <Spinner label="Working" />}
      {children}
    </button>
  );
}
