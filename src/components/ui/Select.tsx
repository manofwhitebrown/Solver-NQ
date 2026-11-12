import type { SelectHTMLAttributes } from 'react';
import { cn } from './cn';
import { controlClass } from './Field';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

/** Native select (best on phones) with the arrow and appearance restyled. */
export function Select({ options, className, ...rest }: Props) {
  return (
    <div className="relative">
      <select className={cn(controlClass, 'appearance-none pr-10', className)} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none">
        <path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
