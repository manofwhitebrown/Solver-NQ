import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import LibraryPage from './LibraryPage';

export const routes: RouteObject[] = [{ path: '/library', element: createElement(LibraryPage) }];
