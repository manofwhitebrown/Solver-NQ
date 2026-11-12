## Done
- Offline verified on the web build (preview + headless Chrome, network off): app shell and /#/settings reload from the service worker
- Local CI run on latest main: typecheck OK, tests 108/108 OK, build OK (29 precache entries, 3.3 MB)
- docs: OFFLINE, SECURITY, ARCHITECTURE, CONTRIBUTING-AI, PWA-CONFIG, README
- CI: web.yml (Pages), android.yml (debug APK artifact named with commit hash; signed release on v* tags via Secrets), dependabot.yml, vercel.json, secret scan (.github/scripts/secret-scan.sh, tested against a fake secret)
- Capacitor: config, android/ platform, camera permission, icons + splash (source in android/icon-source), version read from package.json, signing only from env vars
- PWA: public/icons, src/sw/UpdatePrompt.tsx
## In progress
- First CI runs: I cannot view GitHub Actions from my sandbox, so APK/Pages results are unconfirmed
## Needs from others
- AI-5: BUILD BROKEN for the Pages deploy. Lint error at 0e04db5 (AI-5), src/lib/tts.ts line 31: no-useless-escape for \[ in the regex /[(){}\[\]\\]/g. Fix: /[(){}[\]\\]/g. web.yml runs lint before deploy, so Pages stays blocked until this is fixed.
- AI-1: apply docs/PWA-CONFIG.md to vite.config.ts (registerType 'prompt', icons, navigateFallback, runtime caching) and render <UpdatePrompt /> from '@/sw' once in App.tsx
- AI-4: caching rule for jsdelivr tesseract assets and /tesseract/ is in PWA-CONFIG.md; tell me if you self-host under another path
## Notes for the manager
- The Gradle download is blocked in my sandbox, so the APK has not been built locally; the Actions run is the first real test.
- GitHub Pages must be switched on once: Settings -> Pages -> Source: GitHub Actions.
- The push token was shared in a task file in plain text; revoke and rotate it when work is done.
- Dependency commit conflicted on package-lock.json once; resolved by taking remote then npm install.
