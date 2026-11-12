> **Applied** in `vite.config.ts` and `src/app/App.tsx`. Kept here as a reference.

# PWA config (for AI-1, who owns `vite.config.ts`)

Replace the `VitePWA({...})` block with the one below, and render `<UpdatePrompt />` (from `@/sw`) once inside `App.tsx`.

```ts
VitePWA({
  registerType: 'prompt', // lets <UpdatePrompt /> ask before reloading
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
    navigateFallback: `${base}index.html`, // offline fallback for hash routes
    globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
    runtimeCaching: [
      {
        // OCR worker + wasm core (Tesseract) when loaded from a CDN, or self-hosted under /tesseract/
        urlPattern: ({ url }) =>
          /cdn\.jsdelivr\.net\/npm\/(tesseract\.js|@tesseract\.js-core)/.test(url.href) ||
          url.pathname.includes('/tesseract/'),
        handler: 'CacheFirst',
        options: { cacheName: 'ocr-assets', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
      },
      {
        urlPattern: ({ url }) => /\.(woff2?|ttf)$/.test(url.pathname),
        handler: 'CacheFirst',
        options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
      },
    ],
  },
}),
```

English OCR data (`tesseract/lang/eng.traineddata.gz`) is self-hosted and precached, so the first scan works offline. Other languages are cached by Tesseract in IndexedDB after download (Scan > Scan languages). The non-SIMD core is runtime-cached only.
