## Phase 2 (Notes & Summarizer + Learn v2)
### Done
- P0 notes lib `src/lib/notes`: offline extractive summary (short/medium/detailed), cheat sheet, keywords, glossary, local self-test questions, 60,000-char cap, PDF text via pdf.js (lazy; scanned pages -> OCR), transcript cleaner, cards/quiz from a note, Markdown/TXT export, AI adapter (`transform`, uses AI-2's `transformText` when it exists). 21 tests (incl. PDF fixture, note CRUD with fake-indexeddb).
- P0 screens `src/features/notes`: `/notes` (search, tags), `/notes/new` (paste / file / PDF / photo / transcript, edit before processing, counts, cap notice with "Use the first part"), `/notes/:id` (Summary short/medium/detailed, Cheat sheet, Terms, Test me, Text; "Quick summary (offline)" + "Improve with AI"; flashcards, quiz, save .md/.txt, print/PDF, delete, tags).
- Links: `/learn/cards/new?note=<id>` (preview, dedupe) and `/learn/quiz?note=<id>` (offline quiz from key terms); "Notes" link on /learn.
- P1 layout pass (code): all `/learn/*` screens use `PageHeader`/`Section`/`Stack` (no own padding/`<main>`). Review: close button, progress bar + "N left", content-sized centred card (17/1.7), 64 px grade buttons with next-interval hints, keyboard hints hidden on touch. Home: 128 px goal ring, roomy deck rows, `TodayCard` mounted, 44 px buttons. Stats: empty states, 12 px chart labels with fewer ticks. Quiz: 44 px timed-mode row, 56 px options with ✓/✗ text (not colour alone), weak topics as rows. Cards: `mathToPlain()` in lists, `ActionBar` on the preview.
- P2 done: cram mode (`/learn/review?cram=1`, cards due within 3 days, button on /learn, tested), deck emoji on /learn, no `any` left in my folders.
### In progress
- Screenshots of /learn/* and /notes/* (not seen in a browser by me yet).
### Remaining
- Screenshots (390x844 and 1280x800, light/dark) via `npm run shots` and commit to docs/screenshots. Reminder-after-reboot check (needs device). Deck colours (emoji done, colours not).
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
