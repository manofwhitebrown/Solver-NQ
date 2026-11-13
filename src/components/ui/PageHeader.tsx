import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from './IconButton';
import { BackIcon } from './icons';

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
          <BackIcon />
        </IconButton>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-base text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
