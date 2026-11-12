# Architecture

React + TypeScript + Vite + Tailwind, HashRouter, Dexie (IndexedDB), KaTeX, mathjs, vite-plugin-pwa, Capacitor (Android).

```
src/app          shell, routes (AI-1)
src/lib/ai       AI calls, queue flush (AI-2)
src/lib/db       Dexie storage, backup (AI-3)
src/lib/ocr      text recognition (AI-4)
src/lib/verify   answer checking (AI-5)
src/lib/export   PDF / Markdown / DOCX (AI-6)
src/lib/srs      flashcard scheduling (AI-7)
src/lib/notes    notes + summarizer (AI-7)
src/lib/plan     study planner (AI-6)
src/lib/tts.ts   read-aloud (AI-5)
src/features/*   one folder per screen, each exports `routes`
src/sw           service-worker helpers (AI-8)
```

Offline: the service worker precaches the app shell; data lives in IndexedDB. New AI answers need internet; offline questions are queued and flushed when online.
Delivery: `web.yml` -> GitHub Pages; `android.yml` -> APK artifact (and Release on `v*` tags).

Build and CI (Phase 2): Node 22 everywhere. Vendor groups are split in `vite.config.ts` (`vendor-react`, `vendor-math`, `vendor-data`); `scripts/ci-size.mjs` fails CI if the entry chunk passes 400 kB (currently about 133 kB). `scripts/ci-status.sh` shows recent CI runs and failure messages. `layout-audit.yml` is a manual workflow that uploads screenshots. `ANALYZE=1 npm run build` writes `stats.json` for bundle analysis.
