import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

// VITE_BASE lets GitHub Pages serve the app from /Solver-NQ/
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Solver-NQ',
        short_name: 'Solver-NQ',
        description: 'Scan or type a question, get a step-by-step answer.',
        theme_color: '#1f2a44',
        background_color: '#f7f6f3',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [],
      },
    }),
  ],
  test: { environment: 'node' },
});
