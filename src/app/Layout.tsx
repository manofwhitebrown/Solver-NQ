import { NavLink, Outlet } from 'react-router-dom';
import { Toaster, cn } from '@/components/ui';
import { AskIcon, LearnIcon, LibraryIcon, SettingsIcon } from './icons';
import { NAV } from './nav';
import { OnlineBanner } from './OnlineBanner';

const ICONS = { Ask: AskIcon, Library: LibraryIcon, Learn: LearnIcon, Settings: SettingsIcon };

function Links({ side }: { side: boolean }) {
  return (
    <>
      {NAV.map(({ to, label, end }) => {
        const Icon = ICONS[label];
        return (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center transition',
                side
                  ? 'min-h-[44px] gap-3 rounded-md px-3 text-[15px] font-semibold'
                  : 'min-h-[56px] flex-1 flex-col justify-center gap-0.5 text-[11px] font-medium',
                isActive ? 'text-accent' : 'text-muted hover:text-ink',
                side && isActive && 'bg-accent/10',
              )
            }
          >
            <Icon />
            {label}
          </NavLink>
        );
      })}
    </>
  );
}

export function Layout() {
  return (
    <div className="min-h-full lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface px-4 py-8 lg:flex lg:flex-col lg:gap-1">
        <div className="mb-6 px-3 text-xl font-bold tracking-tight">Solver-NQ</div>
        <nav aria-label="Main" className="flex flex-col gap-1"><Links side /></nav>
      </aside>

      <div className="min-w-0 flex-1">
        <OnlineBanner />
        <main
          className="mx-auto w-full max-w-read px-5 pt-6 lg:max-w-3xl lg:px-10 lg:pt-12 lg:pb-16"
          style={{
            paddingTop: 'max(1.5rem, calc(var(--sat) + 1rem))',
            paddingBottom: 'calc(6.5rem + var(--sab))',
            paddingLeft: 'max(1.25rem, var(--sal))',
            paddingRight: 'max(1.25rem, var(--sar))',
          }}
        >
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'var(--sab)', paddingLeft: 'var(--sal)', paddingRight: 'var(--sar)' }}
      >
        <Links side={false} />
      </nav>
      <Toaster />
    </div>
  );
}
