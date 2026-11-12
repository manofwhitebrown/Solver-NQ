import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './app/index.css';
import { App } from './app/App';

// Demo builds only (npm run shots): expose seedDemoData() to the screenshot tool. Dropped from normal builds.
if (import.meta.env.VITE_DEMO === '1') void import('@/lib/db/demo').then(m => Object.assign(window, { __solverDemo: m }));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
