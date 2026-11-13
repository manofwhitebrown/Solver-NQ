import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/**
 * Checkbox whose real input covers the whole 44 px row (so the tap target is the row), drawn as a
 * rounded brand box. Use this instead of a raw <input type="checkbox">.
 */
export function Checkbox({ label, className, ...rest }: Props) {
  return (
    <label className={cn('relative flex min-h-[44px] cursor-pointer items-center gap-3 text-base', className)}>
      <input type="checkbox" className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0" {...rest} />
      <span
        aria-hidden
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2 border-line-strong bg-surface text-caption font-bold leading-none text-transparent transition',
          'peer-checked:border-transparent peer-checked:bg-accent peer-checked:text-accent-ink',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
          'peer-disabled:opacity-50',
        )}
      >
        ✓
      </span>
      <span>{label}</span>
    </label>
  );
}
