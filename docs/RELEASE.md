# Releasing Solver-NQ

## Debug APK (personal use)
Every push to `main` builds a **debug APK** in the `Android APK` workflow (Artifacts). This is fine for your own phone.

## Optional: signed release APK
1. Create a keystore (keep it safe, never commit it):
   `keytool -genkeypair -v -keystore release.jks -alias solvernq -keyalg RSA -keysize 2048 -validity 10000`
2. Encode it: `base64 -w0 release.jks` (macOS: `base64 -i release.jks`).
3. GitHub → Settings → Secrets and variables → Actions, add:
   `ANDROID_KEYSTORE_BASE64` (the base64 text), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`solvernq`), `ANDROID_KEY_PASSWORD`.
4. Tag and push: `git tag v0.1.0 && git push origin v0.1.0`.
5. The workflow builds `assembleRelease` and attaches the signed APK to a GitHub Release.

The release steps in `android.yml` are unchanged by the Node 22 fix; they run after the debug build on `v*` tags.
