# Solver-NQ

[![Web (GitHub Pages)](https://github.com/manofwhitebrown/Solver-NQ/actions/workflows/web.yml/badge.svg)](https://github.com/manofwhitebrown/Solver-NQ/actions/workflows/web.yml)
[![Android APK](https://github.com/manofwhitebrown/Solver-NQ/actions/workflows/android.yml/badge.svg)](https://github.com/manofwhitebrown/Solver-NQ/actions/workflows/android.yml)

*Built by Mohammed Abdul Nayeem.*

A study app: scan or type a question, get a step-by-step answer, save it in a library, export to PDF / Markdown / DOCX, and practise with flashcards and quizzes. It runs as an **Android app** and as a **web app**, and works offline for everything already saved.

- **Learn mode** reveals the steps one at a time. **Answer mode** shows the full solution.
- **Offline-first:** library, search, flashcards, quizzes and exports work without internet. New questions asked offline are queued and answered when you reconnect.
- **BYOK:** you bring your own AI key. It stays on your device.

## Quick start

```bash
npm ci
npm run dev        # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | typecheck + production build into `dist/` |
| `npm run preview` | serve the production build (use this to test offline) |
| `npm run typecheck` / `lint` / `test` | checks run by CI |

## Open the web version

Every push to `main` deploys to GitHub Pages: **https://manofwhitebrown.github.io/Solver-NQ/**

First-time setup (once): repo **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**.
Prefer Vercel? Import the repo; `vercel.json` is already set up.

## Get the Android APK

New to this? Follow the friendly [User Guide](docs/USER-GUIDE.md). Live web app: https://manofwhitebrown.github.io/Solver-NQ/

1. Open the repo's **Actions** tab, then the latest green **Android APK** run.
2. Download the artifact `solver-nq-debug-<commit>` at the bottom of the run page and unzip it.
3. Copy `app-debug.apk` to the phone and install it (allow "install unknown apps" if asked).

Tagged releases (`v*`) build a signed APK and attach it to a GitHub Release. Signing needs these repository secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Build locally: `npm run build && npx cap sync android && cd android && ./gradlew assembleDebug` (needs Java 21 and the Android SDK).
The app version is the `version` in `package.json`; the Android build reads it from there.

## AI keys (BYOK)

Open **Settings** and paste your own key. It is stored only on your device (never in the repo, never sent to us). There are no daily limits from us; your provider's limits apply. An optional proxy under `api/` can be deployed if you prefer not to call the provider directly from the browser.

Proxy (optional, Vercel): set these in the Vercel project's Environment Variables, then put `https://<your-app>.vercel.app/api/ask` in Settings -> Proxy URL.

| Variable | Required | Meaning |
|---|---|---|
| `AI_API_KEY` | yes | your provider key (stays on the server) |
| `AI_PROVIDER` | no | `anthropic` (default), `openai` or `gemini` |
| `AI_BASE_URL` | no | override the provider base URL |

## Offline

See [docs/OFFLINE.md](docs/OFFLINE.md) for the test steps.

## Folder map

```
src/app          app shell and routes
src/components   shared UI components
src/features     one folder per screen
src/lib          logic: ai, db, ocr, verify, export, srs
src/sw           "update available" prompt
scripts/         CI helpers (ci-status.sh reads Actions results, ci-size.mjs bundle budget)
android/         Capacitor Android project
.github/         CI workflows, secret scan, dependabot
docs/            architecture, security, offline, per-AI status
```

More: [USER-GUIDE](docs/USER-GUIDE.md), [RELEASE](docs/RELEASE.md), [DEVICE-TEST](docs/DEVICE-TEST.md), [ARCHITECTURE](docs/ARCHITECTURE.md), [SECURITY](docs/SECURITY.md), [CONTRIBUTING-AI](docs/CONTRIBUTING-AI.md).
