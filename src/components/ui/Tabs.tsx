import { cn } from './cn';

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string }>;
  label: string;
}

/** Segmented control. */
export function Tabs<T extends string>({ value, onChange, items, label }: Props<T>) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex w-full rounded-md bg-raised p-1">
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          type="button"
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
