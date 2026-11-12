import { HashRouter, useRoutes } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { routes } from './routes';
import { useTheme } from './theme';
import { UpdatePrompt } from '@/sw';

function Routes() {
  return useRoutes(routes);
}

export function App() {
  useTheme();
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes />
      </HashRouter>
      <UpdatePrompt />
    </ErrorBoundary>
  );
}
