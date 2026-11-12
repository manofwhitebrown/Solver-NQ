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
      registerType: 'prompt', // <UpdatePrompt /> asks before reloading
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Solver-NQ',
        short_name: 'Solver-NQ',
        description: 'Scan or type a question, get a step-by-step answer.',
        theme_color: '#1f2a44',
        background_color: '#f7f6f3',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}icons/pwa-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/pwa-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: `${base}index.html`, // offline fallback
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            // OCR worker + wasm core (Tesseract), from a CDN or self-hosted under /tesseract/
            urlPattern: ({ url }) =>
              /cdn\.jsdelivr\.net\/npm\/(tesseract\.js|@tesseract\.js-core)/.test(url.href) ||
              url.pathname.includes('/tesseract/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-assets',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => /\.(woff2?|ttf)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  test: { environment: 'node' },
});
