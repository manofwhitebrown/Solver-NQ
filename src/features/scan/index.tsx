import type { RouteObject } from 'react-router-dom';
import { ScanPage } from './ScanPage';

export { ScanButton } from './ScanButton';
export type { ScanResult } from './result';
export const routes: RouteObject[] = [{ path: '/scan', element: <ScanPage /> }];
