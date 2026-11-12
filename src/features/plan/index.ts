import { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Spinner } from '@/components/ui';

export { TodayCard } from './TodayCard';

// Lazy so the planner screen is not in the main bundle.
const PlanPage = lazy(() => import('./PlanPage'));
const fallback = createElement('div', { className: 'flex justify-center py-24' }, createElement(Spinner));

export const routes: RouteObject[] = [
  { path: '/plan', element: createElement(Suspense, { fallback }, createElement(PlanPage)) },
];
