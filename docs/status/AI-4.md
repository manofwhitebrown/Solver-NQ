## Done
- src/lib/ocr: preprocess (downscale <=2000px, grayscale, contrast, Otsu threshold, rotate), confidence threshold (70), friendly OcrError messages, platform switch.
- recognize(): web path uses Tesseract.js 7.0.0 (pinned), dynamically imported so it stays out of the main bundle; language from Settings (ocrLang). Native path falls back to web until the ML Kit plugin is chosen.
- src/features/scan: cropMath (pure crop-rect helpers) and ScanResult type ({ text, imageDataUrl }).
## In progress
- /scan UI: inputs (camera, gallery, paste, drop, PDF page), crop tool, batch queue, editable text, ScanButton.
- Choosing and vetting the ML Kit Capacitor plugin (not adopted yet).
## Needs from others
- AI-8: offline OCR needs runtime caching of Tesseract assets. Language data (eng.traineddata) is cached in IndexedDB by Tesseract after first use. The worker script and wasm core are fetched from the CDN by default, so the service worker should cache them, or tell me and I will self-host them under /tesseract/.
## Notes for the manager
- Not yet measured: bundle impact of lazy chunks (will report once the UI imports recognize()).
- Native recognizer currently stubbed; no Capacitor dependency added yet (AI-8 owns capacitor config).
