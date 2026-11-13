# App icon and favicon

One mark everywhere: the rounded teal tile with a bold white check, simplified from `src/app/Logo.tsx` (thicker stroke, no padding so it still reads at 16 px).

| | Light | Dark |
|---|---|---|
| Tile gradient | `#0D7068` to `#156280` | `#5ECFC2` to `#7DBEEE` |
| Check | `#FFFFFF` | `#041E1C` |
| Splash background | `#F1F6F6` | `#070F11` |

These are the app's own accent tokens (`src/components/ui/tokens.css`).

## Files
- Web: `public/favicon.svg` (switches to the dark colours with `prefers-color-scheme`), `public/favicon.ico` (16, 32, 48 px, each drawn at its own size), `public/apple-touch-icon.png` (180, full square, iOS rounds it), `public/icons/pwa-192.png`, `pwa-512.png`, `maskable-512.png` (full-bleed; the check sits inside the central 80% and inside the 40% radius safe circle).
- Manifest and tags: `vite.config.ts` (PWA block: icons, `theme_color #0d7068`, `background_color #f1f6f6`) and the `<link rel="icon">` / `theme-color` lines in `index.html`.
- Android (`android/app/src/main/res`): adaptive icon from vectors (`drawable/ic_launcher_background.xml` gradient, `drawable-v24/ic_launcher_foreground.xml` check, `ic_launcher_monochrome.xml` for Android 13 themed icons, wired in `mipmap-anydpi-v26/ic_launcher*.xml`); legacy `mipmap-*/ic_launcher.png` and `ic_launcher_round.png`; `drawable*/splash.png` in light and night; `values/colors.xml` and `values-night/colors.xml`; `windowSplashScreenBackground` in `values/styles.xml`.

## Regenerate
`node scripts/make-icons.mjs` redraws every PNG and the ICO (uses the Chromium that `npm run shots` already uses; no new dependency). The two hand-written files (`favicon.svg` and the Android vectors) use the same coordinates; if you change the mark, change `CHECK` in the script, the SVG path, and the vector `pathData` together (the vectors are the 32-unit path scaled by 2.2 around the centre of the 108 dp canvas).

## What was and was not checked
Seen in a headless Chromium render: the 16/32/48 px favicon frames, the SVG under light and dark colour schemes, the PWA, maskable (circle mask and safe zone) and apple-touch PNGs, the legacy Android icons and both splash screens, plus the adaptive icon rebuilt from the same numbers under circle, squircle and rounded-square masks.
Not checked: the Android resources inside a real Gradle build, the launcher and system splash on a real phone, and the installed PWA icon. The first `Android APK` run and a look at the phone are the test (see `docs/DEVICE-TEST.md`).
