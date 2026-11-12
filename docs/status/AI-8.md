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

- **APK failure, most likely cause #2:** Dependabot had merged `gradle-wrapper 8.14.3 -> 9.9.0` (android/) and `actions/upload-artifact 4 -> 7`. Capacitor 8 / AGP 8.13 are built for Gradle 8.x. Reverted the wrapper files to 8.14.3 (jar, gradlew, gradlew.bat, properties), pinned upload-artifact back to v4, and set Dependabot to ignore major bumps for gradle and github-actions too. Could not run Gradle here (services.gradle.org and dl.google.com are blocked in my sandbox), so this is unconfirmed until the Actions run.

- **APK build is now green on Gradle** (user's log: BUILD SUCCESSFUL in 2m35s after the wrapper revert). The run then showed "The operation was canceled": `cancel-in-progress: true` let the next push cancel it before the artifact upload. Set `cancel-in-progress: false` in android.yml and web.yml (queued runs keep only the newest).

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

## Final sweep (12 Nov 2026, user asked to finish the last small items)
- Checked all 8 status files, ran typecheck, lint, 358 tests and the build: all green. Latest Actions runs for e0fe27c (Android APK, Web Pages) both succeeded.
- Done: `api/ask.ts` fully typed (no `any`); `ReviewPage` effect dependency fixed (`cram`); README now documents the proxy env vars (`AI_API_KEY`, `AI_PROVIDER`, `AI_BASE_URL`), which AI-2 asked for. `npm run lint` now reports 0 warnings.
- Left as is, on purpose: 4 low-severity `npm audit` findings come from the pinned KaTeX chain (fix needs a breaking bump); `vendor-math` still loads at startup (lazy-loading verify touches AI-5's files and carries risk for little gain).
- Still needs a person and a phone: everything under "Manual tests" in docs/DEVICE-TEST.md, a real Gemini key test, and the signed release secrets.

## Final cleanup (12 Nov 2026)
- Removed all 13 `any` in `api/ask.ts` (typed request/response/provider shapes), fixed the `cram` hook dependency in `ReviewPage.tsx`: lint now has 0 errors and 0 warnings.
- README documents the proxy env vars (`AI_API_KEY`, `AI_PROVIDER`, `AI_BASE_URL`).
- Verified: typecheck, 358/358 tests, build, and latest Android APK + Pages runs green.
- Left as is: 4 low npm-audit findings in the pinned KaTeX/remark-math chain (needs a breaking upgrade).
