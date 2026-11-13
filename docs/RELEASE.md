# Releasing Solver-NQ (no coding needed)

A signed release APK needs a **signing key**. You make it once, store four values in GitHub, and keep a backup. About 10 minutes.

**Why this matters:** the key proves future updates come from you. If you lose it you can never update the same app again (Play Store included). Never share it, never put it in the code.

## Debug APK (personal use)
Every push to `main` builds a debug APK in the `Android APK` workflow (Actions, then the run, then Artifacts). Fine for your own phone, but it is not the release.

## Make the signing key (once)

1. On GitHub open the repo, then **Actions**, then **Create signing keystore** (left list), then **Run workflow**.
2. Tick the confirmation box ("I do not have a release key yet") and press the green **Run workflow** button.
3. Wait about a minute until the run has a green tick. Open the run and scroll to **Artifacts** at the bottom.
4. Click **solver-nq-keystore** to download a zip. Unzip it. You get two files: `SECRETS.txt` and `release.jks`.

> **Do this promptly.** This repository is public, so anyone signed in to GitHub could download that artifact while it exists (it also deletes itself after 1 day). Do not start until you have 10 free minutes, and finish steps 5 to 7 in one sitting. Nothing secret appears in the run's log; only the download holds the key.

## Put the four values into GitHub

5. Repo **Settings**, then **Secrets and variables**, then **Actions**, then **New repository secret**. Do this four times. The name is the word before the colon in `SECRETS.txt`; the value is everything after the colon and space:

| Secret name | Where to find the value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the very long line in `SECRETS.txt` |
| `ANDROID_KEYSTORE_PASSWORD` | the line with that name |
| `ANDROID_KEY_ALIAS` | the line with that name (`solvernq`) |
| `ANDROID_KEY_PASSWORD` | the line with that name (same text as the keystore password; that is expected) |

   Copy carefully: no spaces or line breaks at either end of a value.

## Back it up, then delete the download

6. **Back up `SECRETS.txt` and `release.jks` in two different places**, for example a password manager (or encrypted cloud folder) and a USB stick or another person's safe storage. Check that you can open the backup afterwards.
7. Back in the workflow run, delete the artifact: next to **solver-nq-keystore** press the bin icon. Then delete the unzipped files from your Downloads folder and empty the bin.

## Publish version 1.0.0

8. Tell the manager the secrets are in; they write `RELEASE GO` in `docs/status/MANAGER.md`.
9. Create the tag **v1.0.0** (either way works):
   - GitHub: **Releases**, then **Draft a new release**, in **Choose a tag** type `v1.0.0` and pick **Create new tag on publish**, title `v1.0.0`, then **Publish release**.
   - Or on a computer with git: `git tag v1.0.0 && git push origin v1.0.0`.
10. Open **Actions**, then **Android APK**. The run for the tag builds `assembleRelease` and attaches the signed APK to the release page when it finishes (about 5 minutes).
11. Download the APK from the release page and install it over the previous app on your phone. It should update without asking you to uninstall first. If Android says the signature differs, you were running a debug build; uninstall it once and install the release.

## If something goes wrong

- **The release run fails at "Signed release APK":** a secret was pasted with a space or line break, or has the wrong name. Re-save it (a secret cannot be viewed, only replaced) and re-run the failed job.
- **You ran "Create signing keystore" a second time:** it makes a different key. Only replace the four secrets if you have not published anything yet; otherwise keep using the first key from your backup.
- **Lost the key:** you can sign new builds with a new key, but the Play Store and phones will treat it as a different app. Back up first.
- Anything else: copy the last 60 lines of the failing step and send them to the manager.

## For developers
The signing config in `android/app/build.gradle` reads `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD`; `android.yml` decodes the secret into a temp file on `v*` tags. The keystore is PKCS12, so the store and key password are the same value. `.github/scripts/secret-scan.sh` fails the build if a keystore file is ever tracked.
