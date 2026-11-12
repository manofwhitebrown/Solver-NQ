import { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

const DesignGallery = lazy(() => import('./DesignGallery'));
// Not in the nav: open it at /#/design.
export const routes: RouteObject[] = [{ path: 'design', element: createElement(Suspense, { fallback: null }, createElement(DesignGallery)) }];
