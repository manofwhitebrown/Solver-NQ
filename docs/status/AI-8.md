# AI-8 status (Phase 2)

## Done
- P0-1: `android.yml` and `web.yml` now use Node 22 (Capacitor CLI 8.6 needs >=22).
- Risky steps (`npm run build`, `cap sync`, `gradlew assembleDebug`) wrapped so the real error becomes an annotation; `chmod +x gradlew` added.
- `scripts/ci-status.sh` added (lists runs; for failures prints failing step + annotations). Usage: `GITHUB_TOKEN=... bash scripts/ci-status.sh`.

- P1 bundle: added `rollup-plugin-visualizer` (dev, run `ANALYZE=1 npm run build` -> stats.json), `manualChunks` vendor groups in `vite.config.ts` build options, and `scripts/ci-size.mjs` (CI fails if entry chunk > 400 kB; wired into web.yml). **Entry chunk: 1,132.8 kB raw / 339 kB gzip -> 135.7 kB raw / 45.4 kB gzip.** Cause was mathjs (~1 MB) imported statically by `src/lib/verify`; now its own `vendor-math` chunk (641 kB, loaded separately).
- `eslint.config.js`: tiny cross-owner edit, ignore `docs/audit/tools` and `scripts` (manager's audit tool had 28 lint errors).
- Docs: `docs/USER-GUIDE.md`, `docs/RELEASE.md`.

- Dependabot: npm major bumps ignored. `docs/DEVICE-TEST.md` created (AI-4 steps + layout checks merged; other AIs' steps still to merge).

- README: badges, USER-GUIDE link, live URL, scripts/ in folder map. Added optional `layout-audit.yml` (manual run, uploads screenshots + summary; untested, I can't read Actions here).

- DEVICE-TEST.md merged from AI-1/4/5/6/7; ARCHITECTURE.md updated.

- secret-scan.sh: excluded vendored `public/tesseract/` (false positive: an `AIza...` byte pattern inside the Tesseract wasm JS, line 116). Still scans everything else.

- eslint.config.js: also ignore `public` (vendored minified Tesseract files gave 1127 lint errors, failing the web job). Ran the whole web job locally on latest main: secret-scan, typecheck, lint (0 errors), 350 tests, build, size check (entry 174 kB) all pass.

- Also finished AI-7's remaining items (see docs/status/AI-7.md) and verified AI-4 is complete. `engines.node >= 22` is in package.json (AI-4 added it).

## In progress
- Waiting for the first Android APK run with Node 22 to see if another failure appears.

## Remaining
- P0: confirm Android APK green + artifact; confirm Web (Pages) green.
- P1: offline re-check (needs a browser; none in my sandbox), final merge of DEVICE-TEST.md from all status files.
- P2: ARCHITECTURE.md accuracy, optional layout-audit workflow.

## Needs from others
- AI-5: `vendor-math` (641 kB) still loads at startup because `src/lib/verify/mathEnv.ts` imports mathjs statically. Lazy-load verify (dynamic import in `useAnswer.ts`/`graph/plot.ts`) for a faster first load.
- AI-1: add `"engines": {"node": ">=22"}` to package.json (not done by me yet).

## Notes for the manager
- In my sandbox the GitHub REST API returns 403 ("access not enabled for this session"), so I cannot read Actions runs; git clone/push work. `ci-status.sh` works from any environment where the API is reachable. Until then the user must copy the last ~60 lines of a failing step from the Actions page.

## Manual tests for the user
- After pushing, open the repo Actions tab: `Android APK` and `Web (GitHub Pages)` should both be green; download the APK artifact and install it.
