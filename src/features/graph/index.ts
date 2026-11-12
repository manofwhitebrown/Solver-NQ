import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { GraphPage } from './GraphPage';

// /graph?f=x^2&f=sin(x) opens with those functions already entered.
export const routes: RouteObject[] = [{ path: 'graph', element: createElement(GraphPage) }];
