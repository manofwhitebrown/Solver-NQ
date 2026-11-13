# AI-8 status (Phase 6, 13 Nov 2026)

## Phase 6 (13 Nov 2026) - keystore helper, icons, device checklist
- **Keystore helper:** `.github/workflows/create-keystore.yml` (manual, needs a confirm tick). Random password via `openssl rand`, masked with `::add-mask::`, only the public SHA-256 fingerprint is printed. Uploads one artifact `solver-nq-keystore` (1-day retention) with `SECRETS.txt` (the four secret values) and `release.jks`. Store and key password are the same value because PKCS12 requires it; the alias is `solvernq`. `docs/RELEASE.md` rewritten for a non-developer (run it, copy four values, delete the artifact, back up in two places, tag `v1.0.0` from the GitHub Releases page or with git).
  - Ran: the workflow's script body locally with a real `keytool` (key generated, base64 round trip identical, password opens the key, alias correct, YAML valid).
  - NOT run: the workflow itself on GitHub Actions (my sandbox cannot start workflows). The user's first run is the real test.
  - Heads-up: artifacts of a **public** repo can be downloaded by any signed-in GitHub user until deleted. RELEASE.md tells the user to finish and delete within one sitting (it also expires after a day). If the repo is public and that worries the manager, the safer option is to make the repo private for the 10 minutes it takes.
- **Icons:** one mark (teal tile + bold white check, from `Logo.tsx`). `public/favicon.svg` (dark-tab aware), `favicon.ico` (16/32/48), `apple-touch-icon.png`, `icons/pwa-192/512/maskable-512.png`; manifest + `index.html` links + precache; Android adaptive icon (vector layers + Android 13 themed monochrome), legacy launcher PNGs, light and night splash screens, `colors.xml` + `values-night`. Details and regenerate command in `docs/ICONS.md` (`node scripts/make-icons.mjs`, no new dependency).
  - Seen in a headless Chromium render: 16 px frame and 16 px SVG on light and dark tab colours, maskable under circle mask and safe zone, all Android PNGs and splashes. The adaptive icon was only seen as a reconstruction from the same numbers.
  - NOT verified: the Android resources in a real Gradle build (Gradle and dl.google.com are blocked here; the `Android APK` run is the test, one new attribute `windowSplashScreenBackground` in `styles.xml` is the likeliest thing to need a fix), the launcher and splash on a phone, the installed PWA icon.
- **DEVICE-TEST.md:** rewritten and shortened, grouped Phone (Android) and Laptop, merged from AI-1..7 plus the leftovers list (reboot reminder, install over old APK, cloud sync, real Gemini key, icon check).
- Before the push: typecheck, lint, 388 unit tests, secret scan, and 15/15 `npm run e2e` all passed; production build with `VITE_BASE=/Solver-NQ/` has the right icon links, manifest and precache.

## In progress
- Waiting for the `Android APK` and `Web` runs on this push (I cannot read Actions from here; the user or manager must tell me if either is red).

## Needs from others
- AI-1: `src/app/theme.ts` still sets the `theme-color` meta to `#0d0f15` / `#f0f2f6`, which no longer match the app background. Please use `#f1f6f6` (light) and `#070f11` (dark), the same as `--bg` in `tokens.css`. I kept a single `theme-color` meta in `index.html` because that code only updates the first one.
- AI-1 (optional): add `"icons": "node scripts/make-icons.mjs"` to `package.json` scripts.
- Manager: write `RELEASE GO` in `docs/status/MANAGER.md` after the user has added the four secrets (job 5, Play Store assets and privacy policy, waits for the signed release).

## Manual tests for the user
- Actions, **Create signing keystore**, Run workflow: it goes green and one artifact `solver-nq-keystore` appears with `SECRETS.txt` and `release.jks`; follow `docs/RELEASE.md`.
- After the next APK build: the launcher icon is the teal tick tile (also as an Android 13 themed icon), the splash is light or dark with the tile, the browser tab shows the tick on light and dark tabs. All of this is in `docs/DEVICE-TEST.md`.

---
# Earlier phases (history)

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

## Leftovers finished (12 Nov 2026, second sweep)
- AI-5/AI-8: `verify()` loads its math checks lazily and `/graph` is a lazy route, so `vendor-math` (641 kB) is no longer fetched at startup. Entry chunk 174 kB (limit 400).
- AI-6: study-pack Contents page now shows the page number of each answer (body is built first so numbers are exact; text and pretty PDFs both record start pages).
- AI-5: inline equations in paragraphs/list items no longer widen the page (`answer.css`); needs a phone check.
- AI-4: Scan header button shortened to "New" (aria-label "New image") so the title stays on one line.
- AI-7: screenshots added for `/notes/new` and `/notes/:id` (`notes-new-*`, `note-detail-*`).
- shots.mjs: reloads after setting the onboarded flag, so the first captured route is no longer the welcome screen.
- Not done on purpose: AI-2 streaming and shared proxy logic (larger, risky changes); all real-device tests.

## Phase 3 sweep (12 Nov 2026)
- Security: git history scanned (no real secrets), CSP added to production builds, Android auto-backup off, saved AI-key state is now validated on load (a damaged value no longer crashes the app, 2 new tests), review written in docs/SECURITY.md.
- E2E: real-browser run with mocked Gemini (ask -> answer page with steps, 8 routes visited): no console or CSP errors.
- Performance: entry chunk 174 kB, mathjs lazy.
- Accessibility/layout: tap targets raised to 44 px on Scan languages, question Show more, Settings setup-guide link, Export Open library, note tag chips. Still under 44: plan day buttons at 320 px wide (37 px), laptop-only plan links, raw checkboxes inside larger labels.
- Not run: full screenshot/axe re-run after these fixes (takes ~10 min); run `npm run shots` locally. Note: shots/demo builds skip the CSP so axe can inject.
- Needs the user: real-device test (docs/DEVICE-TEST.md), signing secrets + `v1.0.0` tag for the signed APK.

## Where things stand (12 Nov 2026)
- Done: Phase 2 and Phase 3 parts 2, 3, 5; part 4 mostly. Credit "Built by Mohammed Abdul Nayeem" added in Settings > About and README.
- Left: part 7 full audit re-run; user-only items (real-device tests, signing secrets + v1.0.0 tag). Full table in `docs/ROADMAP.md` ("Current status").
