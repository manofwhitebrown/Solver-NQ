import type { ReactNode } from 'react';
import { cn } from './cn';

/**
 * Sticky bottom action bar (Save, Export, Next...). On phones it sits ABOVE the tab bar;
 * on laptops it sits at the bottom, beside the sidebar. Give the page ~6rem of bottom padding.
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 z-30 border-t border-line bg-surface px-5 py-3',
        'bottom-[calc(var(--tabbar-h)+var(--sab))] lg:bottom-0 lg:left-[264px]',
        className,
      )}
    >
      <div className="mx-auto flex max-w-read items-center gap-3 lg:max-w-wide">{children}</div>
    </div>
  );
}
