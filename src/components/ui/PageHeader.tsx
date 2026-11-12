import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from './IconButton';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Show a Back button (true = history back, string = go to that path). */
  back?: boolean | string;
}

/** The only way to render a page title: same size, weight and position everywhere. */
export function PageHeader({ title, subtitle, actions, back }: Props) {
  const nav = useNavigate();
  return (
    <header className="mb-8 flex items-start gap-3">
      {back && (
        <IconButton label="Back" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))} className="-ml-2 mt-0.5 shrink-0">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
        </IconButton>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
