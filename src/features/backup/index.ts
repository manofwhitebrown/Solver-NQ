import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import BackupPage from './BackupPage';

export { BackupPanel } from './BackupPanel';
export const routes: RouteObject[] = [{ path: '/backup', element: createElement(BackupPage) }];
