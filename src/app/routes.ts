import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { routes as answer } from '@/features/answer';
import { routes as ask } from '@/features/ask';
import { routes as backup } from '@/features/backup';
import { routes as exportRoutes } from '@/features/export';
import { routes as graph } from '@/features/graph';
import { routes as learn } from '@/features/learn';
import { routes as library } from '@/features/library';
import { routes as scan } from '@/features/scan';
import { routes as settings } from '@/features/settings';
import { Layout } from './Layout';
import { NotFound } from './NotFound';
import { Placeholder } from './Placeholder';

const featureRoutes: RouteObject[] = [
  ...ask, ...scan, ...answer, ...library, ...learn, ...exportRoutes, ...settings, ...graph, ...backup,
];

// Any main path nobody has claimed yet gets a placeholder, so every tab always works.
const MAIN: Array<[path: string, name: string]> = [
  ['library', 'Library'], ['learn', 'Learn'], ['scan', 'Scan'], ['export', 'Export'], ['graph', 'Graph'],
];
const claimed = new Set(featureRoutes.map((r) => (r.index ? '' : r.path)));
const placeholders: RouteObject[] = MAIN.filter(([p]) => !claimed.has(p)).map(([path, name]) => ({
  path,
  element: createElement(Placeholder, { name }),
}));
if (!featureRoutes.some((r) => r.index || r.path === '')) {
  placeholders.push({ index: true, element: createElement(Placeholder, { name: 'Ask' }) });
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: createElement(Layout),
    children: [...featureRoutes, ...placeholders, { path: '*', element: createElement(NotFound) }],
  },
];
