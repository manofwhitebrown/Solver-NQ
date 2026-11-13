## Phase 2 (Notes & Summarizer + Learn v2)
### Done
- P0 notes lib `src/lib/notes`: offline extractive summary (short/medium/detailed), cheat sheet, keywords, glossary, local self-test questions, 60,000-char cap, PDF text via pdf.js (lazy; scanned pages -> OCR), transcript cleaner, cards/quiz from a note, Markdown/TXT export, AI adapter (`transform`, uses AI-2's `transformText` when it exists). 21 tests (incl. PDF fixture, note CRUD with fake-indexeddb).
- P0 screens `src/features/notes`: `/notes` (search, tags), `/notes/new` (paste / file / PDF / photo / transcript, edit before processing, counts, cap notice with "Use the first part"), `/notes/:id` (Summary short/medium/detailed, Cheat sheet, Terms, Test me, Text; "Quick summary (offline)" + "Improve with AI"; flashcards, quiz, save .md/.txt, print/PDF, delete, tags).
- Links: `/learn/cards/new?note=<id>` (preview, dedupe) and `/learn/quiz?note=<id>` (offline quiz from key terms); "Notes" link on /learn.
- P1 layout pass (code): all `/learn/*` screens use `PageHeader`/`Section`/`Stack` (no own padding/`<main>`). Review: close button, progress bar + "N left", content-sized centred card (17/1.7), 64 px grade buttons with next-interval hints, keyboard hints hidden on touch. Home: 128 px goal ring, roomy deck rows, `TodayCard` mounted, 44 px buttons. Stats: empty states, 12 px chart labels with fewer ticks. Quiz: 44 px timed-mode row, 56 px options with ✓/✗ text (not colour alone), weak topics as rows. Cards: `mathToPlain()` in lists, `ActionBar` on the preview.
- P2 done: cram mode (`/learn/review?cram=1`, cards due within 3 days, button on /learn, tested), deck emoji on /learn, no `any` left in my folders.
- Continued by AI-8 (AI-7 hit its limit): screenshots of /learn, /learn/review, /learn/quiz, /learn/stats, /learn/cards and /notes (phone + laptop, light + dark) taken with `npm run shots` and committed; I looked at /learn, /learn/review and /notes on a phone and they read cleanly. Fixed "1 cards" -> "1 card" and the 19 px-high "Back to Learn" links on Stats and Quiz results (now block-level, full button height).
- Fixed `scripts/shots.mjs` (AI-3's file, tiny edit): onboarding is now a field in `solver-nq:settings`, so every earlier screenshot run showed the welcome screen; the script now sets it and reloads. Partial runs (`npm run shots -- /learn`) now write images to `docs/screenshots` as the README says (they went to `shots-out/` before, after deleting the old ones).
### In progress
- Nothing.
### Remaining
- Reminder-after-reboot check on a real Android device. Reading the plugin: @capacitor/local-notifications ships a `LocalNotificationRestoreReceiver` (BOOT_COMPLETED) and RECEIVE_BOOT_COMPLETED, so the daily reminder should come back after a reboot, but it is untested on a device. Some phone makers (aggressive battery savers) can still block it; the app cannot fix that.
- Deck colours: done (soft tint behind the emoji, subject name always shown as text). `/notes/new` and `/notes/:id` have no screenshots yet (the shots config only lists `/notes`; AI-3 would need to add the demo note id).
### Needs from others
- AI-2: `transformText` is live and wired (plain Markdown string, as expected). Its opts have no summary length, so I put the length wish in front of the text. If you add a `length` option, tell me and I will switch.
- AI-1: I added `...notes` to `featureRoutes` in `src/app/routes.ts` (one line + import) and a "Notes" link on /learn. Please add Notes to nav if wanted.
### Notes for the manager
- AI quiz for a note is not used: `generateQuiz` works on saved library questions, so note quizzes are local only. AI "Test me" questions are shown as text (not stored; Note has no field for them).
- Offline vs AI: a note with no stored `summary` shows the live offline summary; AI results are stored in `summary`/`cheatsheet`/`keyTerms`.
### Manual tests for the user
- Paste a page of notes, get a summary offline (airplane mode), then improve with AI; make cards; quiz yourself; import a PDF (also try a scanned one and a photo).
- Print or PDF on a note: the tab bar and buttons should be hidden in the print preview.

## Phase 1 (complete)
- src/lib/srs: SM-2 scheduler (nextReview, previewIntervals), local-day/streak/daily goal, offline card maker + dedupe, Anki CSV/TSV import/export, quiz scoring + weak topics, review session queue. 20 unit tests.
- makeCardsFromAnswer (local first, then generateCards when online, falls back silently).
- /learn home (due count, streak, goal ring, decks by subject, Start review / Start quiz).
- /learn/review: flip card, 4 grade buttons with next-interval preview, keyboard (Space, 1-4), swipe on phone (left Again, right Good, up Easy, down Hard), session summary.
- /learn/quiz: setup (subject/tag/count/timed), multiple choice + self-graded short answer, timed exam mode, results with score + weak topics, retry the wrong ones. Uses generateQuiz when online, falls back to a local builder (buildLocalQuiz) on any failure.
- /learn/stats: streak, accuracy, 30-day retention, reviews per day (SVG bars), daily accuracy (SVG line), new/learning/mature card counts. Linked from /learn.
- /learn/cards: search, filter by deck, edit (front/back/deck), delete with confirm, import CSV/TSV (Anki-style, skips duplicates, validates subject), export TSV/CSV of the shown cards via saveFile.
- /learn/cards/new?answer=<id>: previews cards from makeCardsFromAnswer, untick/edit, saves only the chosen ones.
- Daily reminder: ReminderService interface (src/lib/srs/reminder.ts), Capacitor LocalNotifications on Android (loaded on demand), no-op on web; toggle + time on /learn, hidden on web. Added @capacitor/local-notifications 8.3.1 (own commit).
- Review fixes: swapped my 3 raw checkboxes for the shared <Checkbox> (AI-1's note); review cards and quiz questions/answers now render Markdown + KaTeX via AI-5's Markdown, lazy-loaded (KaTeX stays in its own chunk); removed `any` in my test.
- Quiz safety: AI-made quiz items are sanitized (sanitizeQuizItems). Multiple choice whose options do not contain the answer, or have fewer than 2 options, becomes a self-graded short-answer item, so no question is impossible to get right.
- End-to-end flow test (src/features/learn/flow.test.ts, real db via fake-indexeddb, AI offline): make cards -> no duplicates on repeat -> review with Good gives intervals 1, 3, 8 days -> quiz from saved questions -> weak topics + retry list. Passes.
- Small extras: tap a deck on /learn to review only that deck (/learn/review?subject=...); daily goal selector (10/20/30/50/100) on /learn.
## In progress
- COMPLETE: every item in the task file is built and pushed. Waiting for the manager's audit.
## Needs from others
- AI-8: thanks for POST_NOTIFICATIONS and the sync. Still worth checking on a device that the daily reminder fires and survives a reboot.
- AI-5: a "Make flashcards" button on the answer page should link to `/learn/cards/new?answer=<id>` (route is live now) so users can preview then save cards.
- AI-2: generateQuiz is a stub; I will build the local fallback so quiz works offline regardless.
## Notes for the manager
- Not verified by me: screens in a real browser/phone (no DOM test environment here), and the Android reminder on a device. Please include /learn, /learn/review, /learn/quiz, /learn/stats, /learn/cards, /learn/cards/new in the phone-layout audit.
- Quiz uses QuizItem from src/types.ts. Timed mode = 1 minute per question; unanswered items count as wrong at time-up.
- Interval is in days; Again relearns in 10 minutes; ease floor 1.3; streak survives until end of the next local day.

## 13 Nov 2026 (AI-7): QA bugs B1-B6 were already fixed on main by AI-1/AI-4 while I worked
I dropped my duplicate code and task files and merged onto theirs. Added only the missing regression tests (cut-off reply falls to next model; empty reply and 5xx are `server`, not `exhausted`). Not verified by any AI: real Gemini, camera, ML Kit OCR.

## 13 Nov 2026 (AI-7): closed the edge case AI-6 reported to AI-2
After a server failure the 30 s rest was stored as a quota cooldown, so a second ask inside 30 s said "all free limits are used up" and queued. New cooldown kind `brief` (not counted by `earliestRetry`; still shown as cooling in settings). A rested slot now reports `server`. Test added. AI-2/AI-6: nothing left to do for this.

## 13 Nov 2026 (AI-7): Phase 5 design, Learn lane (on AI-1's teal foundation; my earlier violet wave was dropped to avoid a clash)
Learn home: brand-gradient hero (progress ring, big due count, streak pill, Start review / Start quiz inside it); decks are subject tiles with a due badge; Review flashcard is a larger card with a gradient top edge and a Question/Answer pill; thicker progress bar. Fixed axe findings: deck link names now match visible text; Review has an h1 (visually hidden). Learn routes: 0 axe findings, 0 layout findings except the shared Checkbox input (20 px) on /learn/quiz: **AI-1** please make the Checkbox input itself 44 px or enlarge its hit area (label is already 44 px). Still to do in my lane: Notes screens, Quiz run/results, Stats, Cards manager polish. Typecheck, lint, 385 tests pass.

## 13 Nov 2026 (AI-7): Learn + Notes lane complete
Notes list rows use SubjectTile; note detail actions regrouped (primary pair, "Save or share" row, red text Delete); Stats tiles use brand-coloured numbers; shared `Checkbox` rebuilt with a full-row 44 px input and a branded box (fixes the last /learn/quiz tap-target finding for every checkbox in the app; AI-1: done, nothing to do). learn + notes routes: 0 axe, 0 layout findings. 388 tests pass.

## CLAIM (AI-7, 13 Nov): taking the Home/Ask screen design (AI-2's lane, no design commits from AI-2). Paths: src/features/ask/*. Others please do not edit these files until I post "ASK DONE" here.

## 13 Nov 2026 (AI-7): Home/Ask Design v3 (src/features/ask/*)
Greeting line by local hour (`greeting.ts`, tested); big input card; subject chips (left fade removed so the selected chip is never washed out; snap padding now matches the row padding on tablet/laptop); recent list with an empty hint; **thinking** state shows the question being answered and, after 12 s, says the next model takes over if the first is busy; **queued** card (`QueuedCard`: clock icon when free limits are used up, wifi-off icon when offline, "Ask another" + "Open library"); **error** banner (`ErrorBanner`: icon + text, "Open settings" for key/model/request problems, "Try again" otherwise, none for a safety-blocked question, "Dismiss"). Scan button, Send button and the autoSend hand-off code are unchanged.
Checked in headless Chromium against a mocked Gemini, with a temporary script (not committed): widths 320, 360, 390, 430, 1280; light and dark; states idle, thinking, queued (offline), error (bad key), no key, with recent items. Result: no sideways scroll in any of the 60 combinations, no tap target under 44 px. I looked at screenshots for 320 dark error, 360 light, 1280 light and 1280 dark. Gate: typecheck, lint, 390 tests, `npm run e2e` 15/15.
Not verified: the autoSend hand-off from /scan was not exercised end to end (code untouched); real Gemini; a real phone. The "Ready to work offline" toast covers the page title for a few seconds on first load (AI-8/AI-1 owns it).
### Needs from others
- AI-2: no new data needed. I read `AiError.code` and `retryAt` from `askQuestion` as they are today. If R3 adds codes (cut-off, empty reply) they fall into "Try again" automatically; tell me if one should open Settings instead.
- AI-3: `npm run shots` for `/` in all five widths for the before/after.

## 13 Nov 2026 (AI-7): Phase 4 offline AI research spike: docs/OFFLINE-AI.md
Research only, nothing built. Numbers are third-party (links in the doc), none measured by us. Verdict: the 1.5 GB limit is met (Qwen2.5-1.5B 4-bit is about 940 MB); laptop WebGPU is realistic (about 35 to 65 tokens/s for 1B models on Apple chips); mid-range Android is marginal (16.5 tokens/s GPU, 7.8 CPU on a 2020 Snapdragon 865; no real mid-range figure); accuracy of a 1.5B model is about 74% GSM8K and 53% MATH500, a 1B Llama about 45 to 49% and 27 to 31%. Gemma 3 1B maths accuracy: no trustworthy source found. Proposed gate before any build: a 30-question measuring page that the user runs on laptop and phone. **Waiting for the user's go-ahead.**
### Needs from others
- AI-8: WebGPU inside the Capacitor Android WebView is unverified; include it in `docs/DEVICE-TEST.md` only if the user approves the spike.

## 13 Nov 2026 (AI-7): Ask wired to AI-2's voice and streaming
Mic button (`VoiceButton`, 48 px, only where `voiceSupported()`) sits between Scan and Send; it never sends, and `voice.stop()` runs before Send. Voice errors show as a `role="alert"` line. Streaming: `useAsk` passes `onPartial` to `askQuestion` and keeps the step titles written so far (`previewAnswer`, display only); the Thinking card lists the last 4 under "Steps so far" and clears them on success, failure, cancel and queue. The action row now wraps, so at 320 px Send gets its own full-width row instead of being squeezed. Checked again in headless Chromium at 320/360/390/430/1280, light and dark, idle/thinking/error: no sideways scroll, no tap target under 44 px, mic present in idle and error.
Not verified: a real microphone or the Android speech plugin; the streamed step list against a real streaming reply (the mock hangs or errors, it does not stream, so that list was never seen on screen).
Earlier typecheck error in `src/lib/ai/voice/speech.ts` was my stale `node_modules` (AI-2 added a dependency); after `npm ci` main typechecks clean.

ASK DONE (AI-7): `src/features/ask/*` is free for others to edit again.

### Correction (AI-7, 13 Nov): my push 6a65b07 broke 3 e2e checks; fixed in the next commit
I pushed while `npm run e2e` showed 12/15 (my shell chain hid the exit code). Cause: wiring `onPartial` makes Ask use Gemini's streaming endpoint, and the e2e mock only answered in plain JSON, so every streamed reply looked empty. Fix: `scripts/e2e.mjs` (AI-3's file, small edit) now answers `streamGenerateContent` URLs with server-sent events, like the real API. e2e is 15/15 again, and the answer path is now exercised through streaming. **AI-3:** please keep that mock helper when you grow the e2e. Real streaming against real Gemini is still unverified.
