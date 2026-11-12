# Security

- **AI keys (BYOK)** are pasted by the user in Settings and stored only on the device. They are never in code, git, CI or logs.
- **GitHub token**: used only through a shell variable and `http.extraheader`. Never in a file, remote URL, commit message or log.
- **Never in git:** tokens, API keys, keystores (`*.jks`, `*.keystore`, `*.p12`), `.env` files, passwords.
- **Android signing** uses GitHub Secrets only: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
- **CI secret scan** (`.github/scripts/secret-scan.sh`) fails the build on key-like patterns or keystore files.
- If a token was ever exposed (for example pasted in a chat or task file), revoke it in GitHub settings and create a new one.

## Phase 3 review (12 Nov 2026)
- **Git history scanned** for GitHub tokens, Google (`AIza`), OpenAI and Anthropic key patterns: no real secrets found (only instruction text and a minified WASM false positive).
- **Content-Security-Policy** added to production builds (`vite.config.ts`): scripts only from the app itself (no inline scripts), no plugins or objects, no framing of other sites. `connect-src` is open because users bring their own AI endpoint.
- **Android auto-backup turned off** (`allowBackup=false`) so saved AI keys are not copied to Google cloud backups. Use the in-app **Backup** screen to move your library to a new phone (backups do not contain AI keys).
- **Keys are stored in plain local storage on the device** (standard for browser/WebView apps, no server involved). Anyone with access to an unlocked phone or browser profile could read them: use a free-tier key with a quota, and delete it in Settings if the device is shared.
- **Proxy (`api/ask.ts`)** allows any origin and rate-limits per IP in memory. Fine for personal use; if you share the URL publicly, restrict `Access-Control-Allow-Origin` to your own site.
- **Dependencies:** 4 low-severity advisories in the pinned KaTeX / remark-math chain (fix needs a breaking upgrade); no moderate or higher findings in production dependencies.
