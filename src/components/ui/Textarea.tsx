import type { TextareaHTMLAttributes } from 'react';
import { cn } from './cn';
import { controlClass } from './Field';

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, 'min-h-[120px] resize-y py-3 leading-relaxed', className)} {...rest} />;
}
