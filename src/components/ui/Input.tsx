import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';
import { controlClass } from './Field';

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...rest} />;
}
