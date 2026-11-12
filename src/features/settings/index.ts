import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';

export const routes: RouteObject[] = [{ path: 'settings', element: createElement(SettingsPage) }];
