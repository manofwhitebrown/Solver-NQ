import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { OnboardingPage } from './OnboardingPage';

export const routes: RouteObject[] = [{ path: 'welcome', element: createElement(OnboardingPage) }];
