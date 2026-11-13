import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  block?: boolean;
  /** lg 48 px (default for primary), md 44 px, sm 36 px (tap area stays 44 px). */
  size?: 'lg' | 'md' | 'sm';
}

const sizes = { lg: 'min-h-[48px] px-6', md: 'min-h-[44px] px-5', sm: 'relative min-h-[36px] px-4 text-sm before:absolute before:-inset-y-1 before:inset-x-0 before:content-[""]' };

const variants: Record<Variant, string> = {
  primary: 'brand-grad text-accent-ink shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface text-ink border border-line-strong shadow-soft hover:bg-raised',
  ghost: 'text-ink hover:bg-raised',
  danger: 'bg-bad text-bg hover:brightness-110',
};

export function Button({
  variant = 'primary', size, loading, block, className, children, disabled, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full text-base font-semibold',
        'transition active:scale-[.98] disabled:cursor-not-allowed disabled:border-transparent',
        'disabled:bg-disabled-bg disabled:bg-none disabled:text-disabled-ink disabled:shadow-none disabled:active:scale-100',
        sizes[size ?? (variant === 'primary' ? 'lg' : 'md')],
        variants[variant], block && 'w-full', className,
      )}
      {...rest}
    >
      {loading && <Spinner label="Working" />}
      {children}
    </button>
  );
}
