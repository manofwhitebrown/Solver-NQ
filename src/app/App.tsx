import { HashRouter, useRoutes } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { routes } from './routes';
import { useTheme } from './theme';
import { UpdatePrompt } from '@/sw';
import { ShareListener } from '@/features/scan';

function Routes() {
  return useRoutes(routes);
}

export function App() {
  useTheme();
  return (
    <ErrorBoundary>
      <HashRouter>
        <ShareListener />
        <Routes />
      </HashRouter>
      <UpdatePrompt />
    </ErrorBoundary>
  );
}
