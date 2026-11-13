import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath } from 'node:url';

// VITE_BASE lets GitHub Pages serve the app from /Solver-NQ/
const base = process.env.VITE_BASE || '/';

// Content-Security-Policy for production builds only (the dev server needs inline scripts).
// connect-src stays open on purpose: users bring their own AI endpoint (Gemini, OpenAI-compatible, Ollama, proxy).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src * data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');
const cspPlugin = () => ({
  name: 'solver-nq-csp',
  apply: (_c: unknown, env: { command: string }) => env.command === 'build' && process.env.VITE_DEMO !== '1',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' as const }],
});

export default defineConfig({
  base,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    cspPlugin(),
    react(),
    process.env.ANALYZE ? visualizer({ filename: 'stats.json', template: 'raw-data' }) : null,
    VitePWA({
      registerType: 'autoUpdate', // new versions install and apply on their own (no stale cached app after a deploy)
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
        skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true,
        navigateFallback: `${base}index.html`, // offline fallback
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}', 'tesseract/lang/eng.traineddata.gz'], // English OCR data: first scan works offline
        globIgnores: ['tesseract/tesseract-core-lstm.wasm.js'], // non-SIMD core: runtime-cached only, saves 4 MB on install
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
  build: {
    rollupOptions: {
      output: {
        // Vendor groups (AI-8). Keeps the entry chunk small and cache-friendly.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/(mathjs|decimal\.js|typed-function|complex\.js|fraction\.js|seedrandom|javascript-natural-sort|escape-latex|tiny-emitter)\//.test(id)) return 'vendor-math';
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)) return 'vendor-react';
          if (/node_modules\/(dexie|minisearch)\//.test(id)) return 'vendor-data';
          return undefined;
        },
      },
    },
  },
  test: { environment: 'node' },
});
