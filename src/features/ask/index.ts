import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { startQueueFlush } from '@/lib/ai';
import { AskPage } from './AskPage';

// routes.ts imports this file at app start, so this is where the offline queue wakes up.
startQueueFlush();

export const routes: RouteObject[] = [{ index: true, element: createElement(AskPage) }];
