import { createElement, lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy so KaTeX, the markdown stack and highlight.js load only when an answer is opened.
const AnswerPage = lazy(() => import('./AnswerPage'));

export const routes: RouteObject[] = [{
  path: 'answer/:id',
  element: createElement(Suspense, { fallback: null }, createElement(AnswerPage)),
}];

export { mathToPlain } from './plainText';
