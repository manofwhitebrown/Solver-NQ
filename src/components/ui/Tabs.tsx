import type { KeyboardEvent } from 'react';
import { cn } from './cn';

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string }>;
  label: string;
}

/** Segmented control. Arrow keys move between options (roving tabindex). */
export function Tabs<T extends string>({ value, onChange, items, label }: Props<T>) {
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = items.findIndex((it) => it.value === value);
    const next = items[(i + dir + items.length) % items.length];
    onChange(next.value);
    e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')[items.indexOf(next)]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey} className="inline-flex w-full rounded-md bg-raised p-1">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          type="button"
          tabIndex={it.value === value ? 0 : -1}
          aria-selected={it.value === value}
          onClick={() => onChange(it.value)}
          className={cn(
            'min-h-[40px] flex-1 rounded-sm px-3 text-sm font-semibold transition',
            it.value === value ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
