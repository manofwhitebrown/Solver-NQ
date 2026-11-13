import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSettings } from '@/lib/settings';
import { Toaster, cn } from '@/components/ui';
import { AskIcon, LearnIcon, LibraryIcon, SettingsIcon } from '@/components/ui/icons';
import { useTabBarForcedHidden } from './tabbar';
import { NAV } from './nav';
import { Logo } from './Logo';
import { OnlineBanner } from './OnlineBanner';

/** Focused flows own the bottom edge, so the tab bar is hidden there. */
const FOCUSED = [/^\/learn\/(review|quiz)/, /^\/answer\//, /^\/welcome/];

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
                  ? 'min-h-[48px] gap-3 rounded-full px-4 text-[15px] font-semibold'
                  : 'min-h-[var(--tabbar-h)] min-w-0 flex-1 flex-col justify-center gap-0.5 text-[12px] font-semibold',
                isActive ? 'text-accent' : 'text-ink-2 hover:text-ink',
                side && isActive && 'bg-accent-soft shadow-soft',
              )
            }
          >
            {side ? <Icon size={20} /> : (
              <span className="flex h-8 w-14 max-w-full items-center justify-center rounded-full transition [[aria-current=page]_&]:bg-accent-soft"><Icon size={22} /></span>
            )}
            {label}
          </NavLink>
        );
      })}
    </>
  );
}

/** True while the on-screen keyboard is open (visual viewport much shorter than the layout viewport). */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const check = () => setOpen(window.innerHeight - vv.height > 150);
    vv.addEventListener('resize', check);
    return () => vv.removeEventListener('resize', check);
  }, []);
  return open;
}

export function Layout() {
  const keyboard = useKeyboardOpen();
  const { pathname } = useLocation();
  const { onboarded } = useSettings();
  const forced = useTabBarForcedHidden();
  const hideTabs = keyboard || forced || FOCUSED.some((r) => r.test(pathname));
  if (!onboarded && !pathname.startsWith('/welcome') && !pathname.startsWith('/design')) return <Navigate to="/welcome" replace />;
  return (
    <div className="min-h-full lg:flex" style={hideTabs ? ({ '--tabbar-h': '0rem' } as React.CSSProperties) : undefined}>
      <aside className="glass sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-line px-4 py-8 lg:flex lg:flex-col lg:gap-1">
        <div className="mb-6"><Logo /></div>
        <nav aria-label="Main" className="flex flex-col gap-1"><Links side /></nav>
        <p className="mt-auto rounded-lg bg-accent-soft p-4 text-sm text-ink-2">
          <span className="block font-bold text-ink">Free to use</span>
          Your key and your notes stay on this device.
        </p>
      </aside>

      <div className="min-w-0 flex-1">
        <OnlineBanner />
        <main id="main" key={pathname} className="animate-[page-in_180ms_ease-out]"><Outlet /></main>
      </div>

      {!hideTabs && (
        <nav
          aria-label="Main"
          className="glass fixed inset-x-0 bottom-0 z-40 flex border-t border-line shadow-lift lg:hidden"
          style={{ paddingBottom: 'var(--sab)', paddingLeft: 'var(--sal)', paddingRight: 'var(--sar)' }}
        >
          <Links side={false} />
        </nav>
      )}
      <Toaster />
    </div>
  );
}
