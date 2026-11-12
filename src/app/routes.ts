import { createElement, type ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Page } from '@/components/ui';
import { routes as answer } from '@/features/answer';
import { routes as ask } from '@/features/ask';
import { routes as backup } from '@/features/backup';
import { routes as design } from '@/features/design';
import { routes as exportRoutes } from '@/features/export';
import { routes as graph } from '@/features/graph';
import { routes as learn } from '@/features/learn';
import { routes as library } from '@/features/library';
import { routes as notes } from '@/features/notes';
import { routes as onboarding } from '@/features/onboarding';
import { routes as plan } from '@/features/plan';
import { routes as scan } from '@/features/scan';
import { routes as settings } from '@/features/settings';
import { Layout } from './Layout';
import { NotFound } from './NotFound';
import { Placeholder } from './Placeholder';

const featureRoutes: RouteObject[] = [
  ...ask, ...scan, ...answer, ...library, ...learn, ...notes, ...exportRoutes, ...settings, ...graph, ...backup, ...plan, ...design, ...onboarding,
];

// Any main path nobody has claimed yet gets a placeholder, so every tab always works.
const MAIN: Array<[path: string, name: string]> = [
  ['library', 'Library'], ['learn', 'Learn'], ['scan', 'Scan'], ['export', 'Export'], ['graph', 'Graph'],
];
// Feature paths may be written with or without a leading slash.
const claimed = new Set(featureRoutes.map((r) => (r.index ? '' : (r.path ?? '').replace(/^\//, ''))));
const placeholders: RouteObject[] = MAIN.filter(([p]) => !claimed.has(p)).map(([path, name]) => ({
  path,
  element: createElement(Placeholder, { name }),
}));
if (!featureRoutes.some((r) => r.index || r.path === '')) {
  placeholders.push({ index: true, element: createElement(Placeholder, { name: 'Ask' }) });
}

// Every screen is wrapped in <Page> here, so gutters come from one place.
const WIDE = new Set(['library', '/library', 'graph', 'learn', 'learn/cards', 'learn/stats', 'export', '/export', 'backup', '/backup', 'design']);
function withPage(list: RouteObject[]): RouteObject[] {
  return list.map((r) => {
    if (r.children || !r.element) return r;
    const key = r.index ? '' : (r.path ?? '');
    return { ...r, element: createElement(Page, { wide: WIDE.has(key) }, r.element as ReactNode) };
  });
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: createElement(Layout),
    children: withPage([...featureRoutes, ...placeholders, { path: '*', element: createElement(NotFound) }]),
  },
];
