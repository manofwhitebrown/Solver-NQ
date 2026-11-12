import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { NewNotePage } from './NewNotePage';
import { NotePage } from './NotePage';
import { NotesList } from './NotesList';

export const routes: RouteObject[] = [
  { path: 'notes', element: createElement(NotesList) },
  { path: 'notes/new', element: createElement(NewNotePage) },
  { path: 'notes/:id', element: createElement(NotePage) },
];
