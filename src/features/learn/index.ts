import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { LearnHome } from './LearnHome';
import { QuizPage } from './QuizPage';
import { ReviewPage } from './ReviewPage';

export const routes: RouteObject[] = [
  { path: 'learn', element: createElement(LearnHome) },
  { path: 'learn/review', element: createElement(ReviewPage) },
  { path: 'learn/quiz', element: createElement(QuizPage) },
];
