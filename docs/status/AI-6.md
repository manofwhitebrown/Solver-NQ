## Done
- Deps (pinned): jspdf, html-to-image, docx, pdf-lib, @capacitor/core, @capacitor/filesystem, @capacitor/share. All lazy-loaded; jsPDF is its own ~400 kB chunk, the export page is a separate ~8 kB chunk, nothing in the main bundle.
- `src/lib/export`: `saveFile` (web download / Android Filesystem cache + Share), Markdown (keeps `$...$`), TXT, JSON, DOCX (math as readable text), selectable-text PDF, "pretty" PDF (KaTeX -> html-to-image blocks, a block is never split across pages), study pack (cover, contents, answers, optional flashcards; merged with pdf-lib), filenames like `Math - Quadratic equations - 2026-11-12.pdf`, `print.css`.
- Contract functions kept: `saveFile`, `exportPdf`, `exportMarkdown`, `exportDocx`, `exportStudyPack` (+ `exportTxt`, `exportJson`, `buildExport` which returns blob/filename/ms so the UI can show size and time).
- `/export?ids=a,b,c` screen: preview (first 3 on screen, all in print), format chips, Options BottomSheet, progress bar, result card (size, time, Save/Share, Open on web), Print button on laptop. No `ids` = study-pack mode with subject / date range / starred filters and flashcards toggle.
- Tests: 11 (filename, plain-text math, markdown, filters, option mapping, and real DOCX / text PDF / study-pack generation in Node). Full repo: typecheck, build, lint (my files), 90 tests all pass.

## Measured (honest numbers)
- Text-mode PDF, 20 synthetic answers (4 steps each), Node, no browser: ~150-210 ms, 78 KB, 10 pages.
- NOT measured yet: pretty-mode PDF time/size, anything on Android. No browser is available in my environment, so the pretty PDF (KaTeX + rasterising) and the screen have only been typechecked and built, never rendered.

## In progress / not done
- Pretty PDF: needs a real browser check (math rendering, page breaks, time and size for a 20-answer pack). A block taller than a page is now cut at blank rows between lines (one slice per page); that path is only unit-tested on the pure row-picking logic, not rendered.
- "Include original question image" now works for PDF (both styles), study pack and DOCX (downscaled JPEG, white background). Not in Markdown/TXT/JSON. Only verified with a generated JPEG in Node tests, not with real saved scans in a browser.
- Markdown "round-trips" is only checked as: math delimiters and structure are preserved. There is no importer, so no true round-trip test.
- DOCX is checked structurally (valid zip with word/document.xml). Not opened in Word.
- Android: `saveFile` untested on a device. `npx cap sync` is needed so the filesystem/share plugins are in the APK.

## Needs from others
- (done by AI-8: android.yml already runs `npx cap sync android`, so the filesystem/share plugins are included.)

## Notes for the manager
- `types.ts` already defines a different `ExportOptions` (includeSteps/includeImages/paper/title). I accept that shape and extend it (`ExportConfig`), mapping it onto an internal `ResolvedOptions`. I did not edit `types.ts`.
- Selectable-text PDF uses the built-in Helvetica font, so non-Latin text (e.g. Hindi, Telugu, Chinese) will not render there. Pretty mode renders via the browser and handles it. A bundled font would be a >1 MB file, so I left it out; tell me if you want it.
- Several AIs push to main at once; my pushes occasionally needed a retry. One of my early local commits accidentally contained a deletion of the stub; I caught it before it reached main and redid it cleanly.
- Replaced my raw checkbox (invalid accent colour, per AI-1's review) with the shared `<Checkbox>` from `@/components/ui`.
- FYI AI-3/AI-7: `saveFile` is real now (web download / Android share sheet); it is no longer a stub.
- FYI: `src/lib/db/__tests__/scale.test.ts` (AI-3) is timing-sensitive: it passed twice alone but failed once during a full run, with and without my changes. Probably flaky under load; owner may want a looser threshold.
