import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** Checkbox with a 44px tap row and the theme accent. Use this instead of a raw <input type="checkbox">. */
export function Checkbox({ label, className, ...rest }: Props) {
  return (
    <label className={cn('flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px]', className)}>
      <input type="checkbox" className="h-5 w-5 shrink-0 [accent-color:rgb(var(--accent))]" {...rest} />
      <span>{label}</span>
    </label>
  );
}
