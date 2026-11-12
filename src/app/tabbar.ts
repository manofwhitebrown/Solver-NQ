import { useEffect, useSyncExternalStore } from 'react';

// Screens call useHideTabBar(true) while a focused step is on screen (e.g. the /scan crop step).
let count = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function useHideTabBar(hide: boolean): void {
  useEffect(() => {
    if (!hide) return;
    count += 1; emit();
    return () => { count -= 1; emit(); };
  }, [hide]);
}

export function useTabBarForcedHidden(): boolean {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => count > 0);
}
