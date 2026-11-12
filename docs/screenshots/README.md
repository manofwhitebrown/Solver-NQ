# Screenshots, layout checks and accessibility scan

`npm run shots` builds the app with demo data (`VITE_DEMO=1`, into `dist-shots/`), serves it, seeds `seedDemoData()` and captures every route.

```bash
npm run shots                      # whole app (about 5-8 minutes), replaces this folder's images and reports
npm run shots -- /library /learn   # only those routes (images replace the matching ones; reports go to shots-out/, not committed)
SHOTS_SKIP_BUILD=1 npm run shots   # reuse the last dist-shots build
```

- **Images:** `<route>__<phone|laptop>__<light|dark>.jpg`. Phone is 390x844, laptop 1280x800. JPEG, at most 150 KB each (very tall pages are cut at 3000 px).
- **`layout.md`:** sideways scroll, overflow, tap targets under 44 px, text under 12 px, content hidden under the tab bar, at 320, 360, 375, 390, 412, 430, 640x360 (landscape) and 1280. Extra sizes run in light mode only and produce no images.
- **`a11y.md`:** axe-core violations per route (reported, the command never fails because of them).
- Routes that do not exist yet are skipped and listed at the end of the run. Routes are listed in `scripts/shots-config.mjs`.
- No browser install is needed: `puppeteer-core` and `@sparticuz/chromium` are dev dependencies. Needs Node 22 and network for `npm ci`.
- Demo ids (for example `/answer/demo-a01`) come from `src/lib/db/demo.ts`.
