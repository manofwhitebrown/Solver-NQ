import { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Spinner } from '@/components/ui';

// Lazy so none of the export UI (or jsPDF/docx/etc.) is in the main bundle.
const ExportPage = lazy(() => import('./ExportPage'));
const fallback = createElement('div', { className: 'flex justify-center py-24' }, createElement(Spinner));

export const routes: RouteObject[] = [
  { path: '/export', element: createElement(Suspense, { fallback }, createElement(ExportPage)) },
];
