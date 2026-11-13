## Phase 2 (12 Nov 2026)
### Done (P0)
- Native OCR: `recognize()` uses ML Kit on Android; any failure OR empty result falls back to Tesseract and returns `backup: true`; Scan shows toast "Using backup reader". Plugin call checked against its README (`detectText({ base64Image })`). 9 mocked-plugin tests: success, empty, plugin missing, permission denied, plugin throws, fallback, web-only.
- Large images: `src/features/scan/imageSize.ts` reads JPEG/PNG header size (incl. EXIF rotation) and `loadBitmap` decodes straight to <= 2400 px with `createImageBitmap` resize options, so a 48 MP photo is never fully decoded. 8 tests for the size math.
- Error flows with kind next steps: camera denied (how to enable in Settings), no camera, file over 25 MB, unsupported file type, PDF with 0 pages.
### Done (P1 item 7, early)
- Rotate hint: confidence < 40 shows "Try rotating the photo" with a one-tap "Rotate and read again" (rotates the crop 90 degrees, re-runs OCR). Plain styling for now; restyle in the layout pass.
- Progress: "Reading... N%" while Tesseract runs (`onOcrProgress`; ML Kit has no progress, shows 0%). "Read with AI" button shown disabled with the reason until AI-2 ships `transcribeImage` (not in `src/lib/ai` yet).
- P2: self-hosted Tesseract in `public/tesseract/` (worker, plain + SIMD LSTM cores, `lang/eng.traineddata.gz`, 11 MB). `src/lib/ocr/assets.ts` builds the URLs from the app base and picks the SIMD core by feature test; English is local, other languages still download from the CDN once. 2 tests. No `any` left in my folders.
- P1 layout pass (Design v2): `/scan` uses PageHeader, a 3-step indicator (Capture, Crop, Check text), a touch-first capture card (Take a photo as the single primary action, 3-step hint, no "drop it here" on touch), a one-time dismissible crop hint, `ActionBar` (Rotate, Enhance, Read text) above the tab bar, crop handles with a 48 px hit area and a 20 px visual dot, ResultCard on Card/Stack with roomy spacing. Checked in headless Chromium at 390x844, 320x568, 640x360 landscape and 1280x800, light and dark: no horizontal overflow, action bar fits at 320. In landscape (360 px high) the steps and hint hide so the crop area and bar fit; the crop scrolls inside its box. Screenshots: `docs/screenshots/scan-*.jpg` (capture and crop steps; result cards not shot because OCR needs a network or the local Tesseract files).
- "Read with AI" is wired to AI-2's `transcribeImage`; the text fills the same editable box (shows AI error messages as toasts, e.g. offline or no key). Not tested with a real key.
- P2 language packs manager: "Scan languages" on the capture card opens a sheet listing each language as built in (English), downloaded (size, Remove) or not downloaded (Download). `src/lib/ocr/langs.ts` reads Tesseract's IndexedDB cache directly (3 tests with fake-indexeddb); `downloadPack` in web.ts fills the cache. Uses `OCR_LANGS` from Settings options (read only). Screenshots `docs/screenshots/scan-langs-*.jpg`.
- Crop step now calls `useHideTabBar(true)` as AI-1 asked (Back arrow in the header, ActionBar at the bottom, more crop room in landscape). Screenshots refreshed. Cross-owner (user approved): added `engines.node >= 22` to package.json (AI-8's request to AI-1).
- Cross-owner (user approved): relaxed the three timing limits in AI-3's `scale.test.ts` by 3x (1.5/3/0.3 s -> 4.5/9/0.9 s); it failed on slow machines (about 1.6 s) with no code change. It still catches real regressions (an O(n^2) list would take far longer).
### Remaining
- DONE by AI-4 at the user's request (cross-owner edit in AI-8's PWA block of `vite.config.ts`, plus one line in `docs/PWA-CONFIG.md`): `eng.traineddata.gz` is now precached and the non-SIMD core is runtime-cached only. AI-8 please pull before touching those lines.
- Checked: no `any` left in src/lib/ocr or src/features/scan; OCR and PDF libs are lazy chunks (P2 item 9 done).
- BLOCKED: P1 needs `DESIGN V2 READY` (AI-1 status still says SCAFFOLD READY; Page/PageHeader/Section/Stack primitives not in components/ui yet) and `transcribeImage` from AI-2 (not in src/lib/ai yet).
- P1 (after `DESIGN V2 READY`): Scan v2 layout, Read-with-AI button, rotate hint, 320 px / landscape checks. P2: language packs manager, remove `any`.
### Notes for the manager
- Checked by AI-8 (AI-4 out of limit): nothing left to build. `transcribeImage` exists in `src/lib/ai`, `engines.node >= 22` is in package.json, scan screenshots are committed and the capture/crop screens read cleanly at 390 px. Minor cosmetic: on the crop step the page title wraps to two lines because of the "New image" button. Only the real-device tests below remain (they need a phone).
- `npm run lint` currently fails with 24 errors outside my folders: `docs/audit/tools/layout-audit.mjs` (browser/node globals not declared; needs an eslint ignore or globals) and `api/ask.ts`. My folders lint clean.
- `scale.test.ts` (AI-3) is still a timing flake in slow sandboxes.
### Manual tests for the user
00. Web: Scan > Scan languages > Download Hindi (online), go offline, set Settings > Scan language to Hindi and scan; it should still read. Remove should return it to Not downloaded.
0. With an AI key or free Gemini set: scan handwriting, tap "Read with AI"; the box should fill with the transcription (formulas as $...$). Offline it should show the offline message.
0. Rotate hint: photograph text held sideways, read it; when the hint appears tap Rotate and read again.
1. Android, camera: Scan > Take a photo > photograph printed text > crop > Read text. Text should appear within a few seconds.
2. Offline: turn on airplane mode, repeat step 1. Native ML Kit should still read it (first run may need the model download once online).
3. Rotated photo: take a photo with the phone sideways; it should display upright. If text is poor, use Rotate and read again.
4. PDF: choose a multi-page PDF, pick a page, crop, read.
5. Permission denied: deny Camera in system settings, tap Take a photo; you should see a message explaining how to allow it.
6. Huge photo: choose a 48 MP photo (or the biggest you have); the app must not freeze or crash.
7. Wrong file: choose a .txt file; you should see "We can only read photos and PDFs".

## Done
- At the user's request I finished AI-5's open items (cross-owner edits, kept minimal): added @capacitor-community/text-to-speech 8.0.2; fixed src/lib/tts.ts, which looked the plugin up via Capacitor.Plugins (empty until the plugin's JS is imported) so Android read-aloud could never find it; it now imports the plugin; ran `npx cap sync android` and committed the resulting gradle lines. Checked the other two: AI-2 already added /?text= prefill, and all 19 KaTeX woff2 fonts are in the service-worker precache. AI-5/AI-8/AI-2 please pull before touching those files.
- Batch queue persists across the Ask round-trip (sessionStorage, 3 tests).
- Unit tests: crop math, preprocessing (fitSize, grayscale, contrast, threshold, Otsu), confidence threshold (12 tests passing).
- Verified AI-2's Ask screen uses my ScanButton and reads { text, imageDataUrl } from router state.
- src/lib/ocr: preprocess (downscale <=2000px, grayscale, contrast, Otsu threshold, rotate), confidence threshold (70), friendly OcrError messages, platform switch.
- recognize(): web path uses Tesseract.js 7.0.0 (pinned), dynamically imported so it stays out of the main bundle; language from Settings (ocrLang). Native path falls back to web until the ML Kit plugin is chosen.
- src/features/scan: /scan route live. Inputs: camera (<input capture>), gallery/file, paste, drag-and-drop, PDF page import (pdf.js 6.5.438, lazy). Crop with drag handles, pinch / Ctrl+wheel zoom, rotate 90, Enhance toggle. Multiple crops from one image become separate result cards (editable text, image, Ask / Send image only / Remove). Low-confidence (<70) shows 'Check the text'. ScanButton exported; Ask/Send navigate to '/' with router state { text, imageDataUrl }.
## In progress
- Testing on a real device/APK and with real photos (nothing verified beyond typecheck/build/lint).
- Choosing and vetting the ML Kit Capacitor plugin (not adopted yet).
## Android plugins chosen
- OCR: @pantrist/capacitor-plugin-ml-kit-text-recognition 8.1.1. Why: on-device ML Kit, peer dependency @capacitor/core >=8 (repo is on 8.6.0), published recently (Sept 2026), small API (detectText with base64). Wrapped in src/lib/ocr/native.ts so it is swappable. ML Kit returns no confidence score, so we report 85 if text was found, 0 if not.
- Camera: @capacitor/camera 8.2.6 (official). Used only on native; web uses <input capture>.
- If the native recognizer fails it falls back to Tesseract.js.

## Needs from others
- AI-8: run `npx cap sync android` so the two plugins are linked, and make sure AndroidManifest has the CAMERA permission (and the camera feature as not required).
- AI-8: ANSWERED. I am NOT self-hosting; keep your rule in PWA-CONFIG.md. Tesseract 7 loads its worker and core from cdn.jsdelivr.net/npm/tesseract.js@v7 and tesseract.js-core@v7 (your pattern matches both). Language data comes from cdn.jsdelivr.net/npm/@tesseract.js-data/<lang> and is cached by Tesseract in IndexedDB, so it needs no SW rule. First OCR must happen online once. (Earlier request, now resolved:) offline OCR needs runtime caching of Tesseract assets. Language data (eng.traineddata) is cached in IndexedDB by Tesseract after first use. The worker script and wasm core are fetched from the CDN by default, so the service worker should cache them, or tell me and I will self-host them under /tesseract/.
## Notes for the manager
- Test src/lib/db/__tests__/scale.test.ts (AI-3) fails in my slow sandbox (about 1.5-1.7 s vs a 1.5 s limit), with or without my changes. Probably a timing flake, but the limit may be tight on slow CI runners.
- Bundle: tesseract.js and pdfjs-dist are lazy chunks, not in the main chunk (checked: 0 matches in index-*.js). My scan code adds ~2-14 kB to main. Main is ~1.1 MB overall mostly from other features, worth a look by the manager. PDF chunk ~444 kB (gzip 134 kB) plus a ~1.27 MB pdf.worker, only loaded when a PDF is chosen.
- Batch: Ask takes one question at a time, so each crop has its own Ask button. The remaining crops are saved in sessionStorage (src/features/scan/queue.ts) and restored when the user returns to /scan (e.g. via the Ask screen's Scan button). No change needed in AI-2's files. The queue lasts for the browser tab session only.
- Not yet verified on a real device or with a real photo (build/typecheck only).
- Native recognizer and camera are implemented but untested on a device. I did not touch android/ (AI-8's).

## Phase 3 fix round (13 Nov 2026)
- Done: crop starts as whole image; Ask button renamed "Review in Ask"; inline persistent error for wrong file type. Typecheck, lint, 16 scan tests pass.
- Needs from others: AI-2 `autoSend` router-state support (optional) so Scan can ask directly. Remaining Phase 4 for me: Android share-to-app target.

## Phase 4: share-to-app (13 Nov 2026)
- Added: `ShareTargetPlugin.java` (reads ACTION_SEND image/*, 25 MB cap, one-shot), manifest intent filter, `MainActivity` registers it, `shareTarget.ts` bridge, `ShareListener` (mounted in `App.tsx`, cross-owner one-line edit; AI-1 please keep it) and ScanPage takes `sharedImage` from router state. 2 web tests; typecheck, lint, 382 tests pass.
- NOT verified: the Java compiles only in the APK build, and the share flow needs a real phone. Manual test added to DEVICE-TEST.md.
