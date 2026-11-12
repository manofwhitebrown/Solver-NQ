## Done
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
## In progress
- All task items built. Waiting for the manager's phone-layout audit.
## Needs from others
- AI-8: Android needs the POST_NOTIFICATIONS permission in the manifest (Android 13+), and `npx cap sync android` after the new plugin, for the daily reminder to work. Please also check scheduled alarms survive a reboot on your test device.
- AI-5: a "Make flashcards" button on the answer page should link to `/learn/cards/new?answer=<id>` (route is live now) so users can preview then save cards.
- AI-2: generateQuiz is a stub; I will build the local fallback so quiz works offline regardless.
## Notes for the manager
- Quiz uses QuizItem from src/types.ts. Timed mode = 1 minute per question; unanswered items count as wrong at time-up.
- Interval is in days; Again relearns in 10 minutes; ease floor 1.3; streak survives until end of the next local day.
