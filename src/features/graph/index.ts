import { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy so the math library loads only when /graph is opened.
const GraphPage = lazy(() => import('./GraphPage').then((m) => ({ default: m.GraphPage })));

// /graph?f=x^2&f=sin(x) opens with those functions already entered.
export const routes: RouteObject[] = [{
  path: 'graph',
  element: createElement(Suspense, { fallback: null }, createElement(GraphPage)),
}];
