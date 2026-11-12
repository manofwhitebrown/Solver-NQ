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

## Completed by AI-8 at the user's request (AI-6 ran out of limit)
- Verified in a real browser (headless Chrome, phone-size screen) with 20 seeded math answers, through the real /export UI. Numbers, desktop Chrome with software rendering:
  - Pretty PDF, 20 answers: 12 pages, ~480-610 KB, 23-26 s
  - Selectable-text PDF: 7 pages, ~31 KB, 0.1 s
  - Study pack (cover, contents, answers): 14 pages, ~480-610 KB, 23-26 s
  - DOCX: 11 KB, opened in LibreOffice (8 pages), math readable; Markdown: 9 KB, math spans kept
- Fixed: Export button was hidden under the phone tab bar (now uses the shared ActionBar); raw `$...$` in headings and contents; `\int` etc. printed as junk in the text PDF (now mapped to ASCII); `\Rightarrow`/`\quad` leaking as words; question printed twice; names like "Study pack - Study pack"; cover now shows the date.
- Added tests: src/lib/export/__tests__/plaintext.test.ts.
- Still not done: not tested on a real Android device (saveFile via Filesystem + Share); contents page has no page numbers; non-Latin text (Hindi, Chinese) shows as ? in the selectable-text PDF, use Pretty mode for those.

# Phase 2 (AI-6, resumed 12 Nov 2026)

## Done (Phase 2)
- P0.1 Pretty PDF numbers: no browser in my environment. I rely on AI-8's real-browser run (20 answers: 12 pages, ~480-610 KB, 23-26 s). Still open: 1 and 5 answer packs, Letter size, visual check of page breaks (see Manual tests).
- P0.2 Memory safety: `pdfPretty` now renders one block at a time (node removed and canvas zeroed right after use), yields to the UI between blocks, forces white paper (`color-scheme:light`), supports **Cancel** (AbortSignal through `buildExport` -> pretty PDF and study pack; leaving the page also aborts), and a block/answer that fails to draw is replaced by a short note while the rest continues (`onWarn` shows "N parts could not be drawn").
- P0.3 `saveFile`: cache dir + file URI + Share (`canShare` check, closed share sheet = `'cancelled'`, not an error), safe file names, chunked base64 (no `FileReader`). 7 mocked-plugin tests in `__tests__/saveFile.test.ts`.

- P1 Study Planner built: `src/lib/plan` (pure `buildPlan`, weak-subject + urgency weighting, 2-4 tasks/day, rest day before an exam, off-days, 60-day cap, re-plans from today so skipped days vanish; storage on AI-3 `kvGet/kvSet` key `study-plan`, also reads the older demo shape; subject stats from flashcards/library/notes). 16 tests. `/plan` screen on Page/PageHeader/Section/Card: exam countdown cards, Today card with progress ring + checkable tasks that deep-link to `/learn/review`, `/learn/quiz?subject=`, `/library?subject=`, `/notes/<id>`, week view (tap a day), Add exam + Settings sheets, friendly empty state. `TodayCard` exported from `@/features/plan` for AI-7.
- Cross-owner edit (tiny, as the task allows): `src/app/routes.ts` registers `...plan`.

## In progress / Remaining
- P1 polish: reminder (optional, skipped), visual check at 320/390/1280 px (no browser here), `TodayCard` mount on `/learn` by AI-7.
- P2 export layout pass (waits for `DESIGN V2 READY`), Obsidian front matter, remove `any`.

## Needs from others
- AI-7: mount `<TodayCard />` from `@/features/plan` on `/learn` (it renders nothing while loading).

## Notes for the manager
- Not mine, seen in a full run: `scale.test.ts` (AI-3) fails under load again; lint errors in `api/ask.ts` (AI-2) and `docs/audit/tools/layout-audit.mjs` (AI-8: node/browser globals not declared in eslint config).

## Manual tests for the user
0. Open `/plan` at 320, 390 and 1280 px, light and dark: add an exam 8 days away, tick a task, tap a week day, open Settings (days off, harder subject). Nothing should scroll sideways. Tell the manager what looks wrong.
1. Laptop Chrome: open `/export` with 1, then 5, then 20 saved answers, format PDF + "Pretty". Note time and size. Check math is sharp, no formula cut across pages, page numbers bottom right, white paper in dark theme. Repeat with Letter.
2. Same 20-answer export: tap **Cancel** halfway. It must stop within a second or two and show "Export cancelled".
3. Android: export a PDF, tap Save/Share, pick Drive or WhatsApp, confirm the file arrives and opens. Close the share sheet without choosing: no error should appear.
4. Android: export DOCX and open it from the share sheet in Word/Docs.

