# AI-8 status (Phase 2)

## Done
- P0-1: `android.yml` and `web.yml` now use Node 22 (Capacitor CLI 8.6 needs >=22).
- Risky steps (`npm run build`, `cap sync`, `gradlew assembleDebug`) wrapped so the real error becomes an annotation; `chmod +x gradlew` added.
- `scripts/ci-status.sh` added (lists runs; for failures prints failing step + annotations). Usage: `GITHUB_TOKEN=... bash scripts/ci-status.sh`.

## In progress
- Waiting for the first Android APK run with Node 22 to see if another failure appears.

## Remaining
- P0: confirm Android APK green + artifact; confirm Web (Pages) green.
- P1: USER-GUIDE.md, RELEASE.md, bundle budget + CI size check, offline re-check (OFFLINE.md), DEVICE-TEST.md.
- P2: Dependabot major-ignore, README update, ARCHITECTURE.md accuracy, optional layout-audit workflow.

## Needs from others
- AI-1: add `"engines": {"node": ">=22"}` to package.json (not done by me yet).

## Notes for the manager
- In my sandbox the GitHub REST API returns 403 ("access not enabled for this session"), so I cannot read Actions runs; git clone/push work. `ci-status.sh` works from any environment where the API is reachable. Until then the user must copy the last ~60 lines of a failing step from the Actions page.

## Manual tests for the user
- After pushing, open the repo Actions tab: `Android APK` and `Web (GitHub Pages)` should both be green; download the APK artifact and install it.
