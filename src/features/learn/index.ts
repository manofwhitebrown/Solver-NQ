import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { CardsPage } from './CardsPage';
import { LearnHome } from './LearnHome';
import { NewCardsPage } from './NewCardsPage';
import { QuizPage } from './QuizPage';
import { ReviewPage } from './ReviewPage';
import { StatsPage } from './StatsPage';

export const routes: RouteObject[] = [
  { path: 'learn', element: createElement(LearnHome) },
  { path: 'learn/review', element: createElement(ReviewPage) },
  { path: 'learn/quiz', element: createElement(QuizPage) },
  { path: 'learn/stats', element: createElement(StatsPage) },
  { path: 'learn/cards', element: createElement(CardsPage) },
  { path: 'learn/cards/new', element: createElement(NewCardsPage) },
];
