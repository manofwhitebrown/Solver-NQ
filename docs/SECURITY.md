# Security

- **AI keys (BYOK)** are pasted by the user in Settings and stored only on the device. They are never in code, git, CI or logs.
- **GitHub token**: used only through a shell variable and `http.extraheader`. Never in a file, remote URL, commit message or log.
- **Never in git:** tokens, API keys, keystores (`*.jks`, `*.keystore`, `*.p12`), `.env` files, passwords.
- **Android signing** uses GitHub Secrets only: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
- **CI secret scan** (`.github/scripts/secret-scan.sh`) fails the build on key-like patterns or keystore files.
- If a token was ever exposed (for example pasted in a chat or task file), revoke it in GitHub settings and create a new one.
