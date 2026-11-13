## Done
- Deps (pinned): jspdf, html-to-image, docx, pdf-lib, @capacitor/core, @capacitor/filesystem, @capacitor/share. All lazy-loaded; jsPDF is its own ~400 kB chunk, the export page is a separate ~8 kB chunk, nothing in the main bundle.
- `src/lib/export`: `saveFile` (web download / Android Filesystem cache + Share), Markdown (keeps `$...$`), TXT, JSON, DOCX (math as readable text), selectable-text PDF, "pretty" PDF (KaTeX -> html-to-image blocks, a block is never split across pages), study pack (cover, contents, answers, optional flashcards; merged with pdf-lib), filenames like `Math - Quadratic equations - 2026-11-12.pdf`, `print.css`.
- Contract functions kept: `saveFile`, `exportPdf`, `exportMarkdown`, `exportDocx`, `exportStudyPack` (+ `exportTxt`, `exportJson`, `buildExport` which returns blob/filename/ms so the UI can show size and time).
- `/export?ids=a,b,c` screen: preview (first 3 on screen, all in print), format chips, Options BottomSheet, progress bar, result card (size, time, Save/Share, Open on web), Print button on laptop. No `ids` = study-pack mode with subject / date range / starred filters and flashcards toggle.
- Tests: 11 (filename, plain-text math, markdown, filters, option mapping, and real DOCX / text PDF / study-pack generation in Node). Full repo: typecheck, build, lint (my files), 90 tests all pass.

## Measured (honest numbers)
- Text-mode PDF, 20 synthetic answers (4 steps each), Node, no browser: ~150-210 ms, 78 KB, 10 pages.
- NOT measured yet: pretty-mode PDF time/size, anything on Android. No browser is available in my environment, so the pretty PDF (KaTeX + rasterising) and the screen have only been typechecked and built, never rendered.

- Seen in a real browser via `npm run shots`: `/plan` (phone/laptop, light/dark) fine, no findings at 320-430 px; `/export` empty state fine. Plan screenshots committed.

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
- P0.1 Pretty PDF measured in real headless Chromium (npm `@sparticuz/chromium`, software rendering, laptop 1280x800, demo data, real Export button): **1 answer 96 KB / 2.2 s; 5 answers 324 KB / 5.5 s; 13 answers 992 KB / 8.9 s** (AI-8 earlier: 20 answers ~480-610 KB / 23-26 s). Not yet looked at: the PDF pages themselves (page breaks, Letter size).
- P0.2 Memory safety: `pdfPretty` now renders one block at a time (node removed and canvas zeroed right after use), yields to the UI between blocks, forces white paper (`color-scheme:light`), supports **Cancel** (AbortSignal through `buildExport` -> pretty PDF and study pack; leaving the page also aborts), and a block/answer that fails to draw is replaced by a short note while the rest continues (`onWarn` shows "N parts could not be drawn").
- P0.3 `saveFile`: cache dir + file URI + Share (`canShare` check, closed share sheet = `'cancelled'`, not an error), safe file names, chunked base64 (no `FileReader`). 7 mocked-plugin tests in `__tests__/saveFile.test.ts`.

- P1 Study Planner built: `src/lib/plan` (pure `buildPlan`, weak-subject + urgency weighting, 2-4 tasks/day, rest day before an exam, off-days, 60-day cap, re-plans from today so skipped days vanish; storage on AI-3 `kvGet/kvSet` key `study-plan`, also reads the older demo shape; subject stats from flashcards/library/notes). 16 tests. `/plan` screen on Page/PageHeader/Section/Card: exam countdown cards, Today card with progress ring + checkable tasks that deep-link to `/learn/review`, `/learn/quiz?subject=`, `/library?subject=`, `/notes/<id>`, week view (tap a day), Add exam + Settings sheets, friendly empty state. `TodayCard` exported from `@/features/plan` for AI-7.
- Cross-owner edit (tiny, as the task allows): `src/app/routes.ts` registers `...plan`.

- P2 done: `/export` rebuilt on `Page`/`PageHeader`/`Section`/`Cluster`/`Stack`; the magic `pb-40` is gone (Page's `--page-bottom` hook clears the tab bar + Export bar); paper preview is a white sheet that shrinks to the screen width (long math scrolls inside its own block, nothing makes the page scroll sideways); options sheet uses shared `Input`; result card on the type scale. Obsidian-friendly Markdown: YAML front matter (title, subject, tags, date, source, answers) for the `.md` format only (TXT/JSON unchanged), tags slugged for Obsidian, 4 tests. `any`: none left in my folders.

- Seen in a real browser: `/plan` and `/export` at 320/390/1280 px, light/dark. No sideways scroll anywhere. Fixed from what I saw: routes.ts already wraps screens in `<Page>`, so my own `<Page>` doubled the gutters (removed in both; Export now ends with a spacer for its action bar); header buttons squeezed the plan title (now a button row under it); exam names truncated; export preview repeated the question under its heading and clipped wide inline math. Screenshots in `docs/screenshots/` (plan-*, export-*, JPEG q70, all < 100 KB).
- Tip for others: the app uses HashRouter, so screenshot URLs are `/#/plan`; reload after setting `solver-nq:settings` `{onboarded:true}`. A headless browser works here via npm `@sparticuz/chromium` + `puppeteer-core`.

## In progress / Remaining
- Optional daily plan reminder (skipped on purpose; no-op on web anyway). `TodayCard` mount on `/learn` by AI-7.
- Open the generated PDF and check page breaks, A4 vs Letter (Manual tests).

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



# Phase 3 fix round + Phase 4 start (AI-6, 13 Nov 2026)

## Done
- Checked the QA bugs: AI-1/AI-3/AI-4 had already fixed B1-B7 in code before I started, so I did not redo them.
- Export now **skips cut-off or blank answers** (older saves from before the cut-off-reply fix) with a clear note on the result card; if everything is skipped the message says to ask again. No empty "Final answer" heading in Markdown, DOCX, text PDF or pretty PDF. `src/lib/export/complete.ts` + 4 tests.
- Study pack at scale: measured **600 answers, text pages: 0.56 s, 1.09 MB, 218 pages** (Node, no browser). Pretty mode costs about 1.2 s per answer, so a pack over 120 answers now switches to text pages automatically and says so on the result card.

## Not verified
- Pretty-mode packs above ~20 answers were not re-measured in a browser; the 120-answer limit comes from the earlier 20-answer timing (23-26 s).
- Real Android share sheet, DOCX in real Word.

## Still to do (Phase 4, mine)
- DONE: Word export polish (numbered headings, each answer on its own page, shaded final answer, page X of Y footer, document title/author; test reads the real zip). Not opened in Word.
- Still open: math as real equations in DOCX (needs OMML conversion, a larger job); UI language pack groundwork if AI-1 wants help.

## Needs from others
- AI-2: with `incomplete` now a failure kind, the transient-cooldown edge case: for 30 s after a server failure a retry can still say "limits used up" (cooldown counted by `earliestRetry`). Suggest cooldown kind `transient` that `earliestRetry` ignores; add a test.

# Phase 6 round (AI-6, 13 Nov 2026)

## Done (all run, not just written)
- **Non-Latin export.** Measured first: the selectable-text PDF printed Hindi/Telugu as `?` and dropped Urdu (`pdfSafe` plus Helvetica). Fix: `src/lib/export/script.ts` detects such text; `buildExport` now switches a text-mode PDF or study pack to the browser-drawn (pretty) pages for those answers, even for big packs, and the result card says so (`usedPrettyForScript`).
- **DOCX.** Unicode text was already stored. Added right-to-left paragraphs and runs for Urdu, and complex-script fonts (`cs`: Nirmala UI for Indic, Arial for Arabic/Urdu). English-only documents get no RTL markup. Tests read `word/document.xml`.
- **Interface languages.** `src/lib/i18n`: dependency-free `t(key, params)` with English fallback (then the key), `setLanguage`/`initLanguage` (saved in `solver-nq:lang`, sets `<html lang dir>`, Urdu = rtl), `useT()` hook. Hindi, Telugu and Urdu are separate lazy chunks. `src/features/i18n/LanguagePicker.tsx` is ready to drop in. 29 keys (answer strings, export, plan, picker).
- **Missing-key test** (`src/lib/i18n/i18n.test.ts`): fails when a shipped language lacks a key, has an extra key, drops or changes a `{placeholder}`, or leaves a string identical to English. Found and fixed a real bug on the way (a junk saved language kept the previous language's strings).
- **Design v3.** Plan: progress ring in the brand gradient (reduced-motion aware, flips in RTL), Today card with glow, week strip with brand-gradient selected day and a marked today (scrolls inside itself at 320), exam day-count tile in the brand gradient, task title links now 44 px tall (were 26 px). Export: preview is one white paper card per answer with a page label (was one long sheet); empty state now has an h1.
- Seen in headless Chromium with demo data: `/plan` and `/export?ids=...` at 320/360/390/430/1280, light and dark: no sideways scroll, no console errors, no tap target under 44 px (the shared Chip is 36 px plus an invisible 8 px hit area by design). Checked: typecheck, lint, 408 unit tests, 15/15 e2e.

## NOT done / not verified (be honest)
- **No Noto font is embedded.** jsPDF does no text shaping, so an embedded font would still print Hindi/Telugu with wrong letter order and Urdu unjoined and left-to-right. A correct selectable-text PDF needs a shaper (e.g. harfbuzzjs, wasm) plus font subsets. I chose the pretty-PDF fallback instead, so no font licence text was needed. The text-PDF test only proves Latin extraction still works; no test extracts Hindi/Telugu/Urdu from a PDF.
- **Not verified:** that the pretty PDF itself draws Hindi/Telugu/Urdu correctly. It relies on the device having a font for the script; headless Chromium here may not, and I did not render a PDF page. Needs a real phone check. DOCX was not opened in Word.
- Hindi, Telugu and Urdu strings are machine-written first drafts and need a native speaker's review.
- RTL: `dir="rtl"` is set, but most screens use physical left/right Tailwind classes (`pl-`, `pr-`, `-ml-`), so Urdu layouts are not mirrored properly yet. Only the ring is handled.
- Only my own Export and Plan labels use `t()`. Everything else is still English until owners switch over.

## Needs from others
- **AI-1 (FYI, done by me, nobody answered):** I put `<LanguagePicker />` (from `@/features/i18n`) at the end of Settings > Appearance, one import plus one line in `SettingsPage.tsx`. Move or restyle it as you like; the component is self-contained.
- **AI-5:** `src/features/answer/strings.ts` could read from `t('answer.*')` (same wording, keys exist in en/hi/te/ur); I did not touch your file.
- **AI-3:** `scripts/shots-config.mjs` opens `#/export?ids=` with answer ids (`demo-a01...`) but Export looks up question ids, so the screenshot always shows "Nothing to export". Use `demo-q01,demo-q02,demo-q03`.
- Cross-owner edit (one small): `src/main.tsx` now awaits `initLanguage()` before rendering, so a saved language shows from the first frame.

## Follow-up (same day)
- Picker is live in Settings > Appearance. Tested in headless Chromium at 320 px: choose Urdu -> `<html lang=ur dir=rtl>`, Export title and subtitle in Urdu, choice survives reload, no overflow, no console errors.
- Found and fixed while testing: the export preview inherited right-to-left, so English maths read backwards in Urdu mode. The paper content now uses `dir="auto"` (follows its own text, not the interface language).
- Still true: Urdu layout mirroring beyond this is only as good as the screens' use of left/right classes; translations are unreviewed drafts.
