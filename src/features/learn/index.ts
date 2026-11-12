import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LearnHome } from './LearnHome';
import { QuizPage } from './QuizPage';
import { ReviewPage } from './ReviewPage';
import { StatsPage } from './StatsPage';

export const routes: RouteObject[] = [
  { path: 'learn', element: createElement(LearnHome) },
  { path: 'learn/review', element: createElement(ReviewPage) },
  { path: 'learn/quiz', element: createElement(QuizPage) },
  { path: 'learn/stats', element: createElement(StatsPage) },
];
