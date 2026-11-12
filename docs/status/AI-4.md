## Done
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
- AI-8: offline OCR needs runtime caching of Tesseract assets. Language data (eng.traineddata) is cached in IndexedDB by Tesseract after first use. The worker script and wasm core are fetched from the CDN by default, so the service worker should cache them, or tell me and I will self-host them under /tesseract/.
## Notes for the manager
- Bundle: tesseract.js and pdfjs-dist are lazy chunks, not in the main chunk (checked: 0 matches in index-*.js). My scan code adds ~2-14 kB to main. Main is ~1.1 MB overall mostly from other features, worth a look by the manager. PDF chunk ~444 kB (gzip 134 kB) plus a ~1.27 MB pdf.worker, only loaded when a PDF is chosen.
- Batch: Ask takes one question at a time, so each crop has its own Ask button. The remaining queue is not kept after navigating to the Ask screen.
- Not yet verified on a real device or with a real photo (build/typecheck only).
- Native recognizer and camera are implemented but untested on a device. I did not touch android/ (AI-8's).
