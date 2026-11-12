## Done
- src/lib/srs: SM-2 scheduler (nextReview, previewIntervals), local-day/streak/daily goal, offline card maker + dedupe, Anki CSV/TSV import/export, quiz scoring + weak topics, review session queue. 20 unit tests.
- makeCardsFromAnswer (local first, then generateCards when online, falls back silently).
- /learn home (due count, streak, goal ring, decks by subject, Start review / Start quiz).
- /learn/review: flip card, 4 grade buttons with next-interval preview, keyboard (Space, 1-4), swipe on phone (left Again, right Good, up Easy, down Hard), session summary.
- /learn/quiz: setup (subject/tag/count/timed), multiple choice + self-graded short answer, timed exam mode, results with score + weak topics, retry the wrong ones. Uses generateQuiz when online, falls back to a local builder (buildLocalQuiz) on any failure.
- /learn/stats: streak, accuracy, 30-day retention, reviews per day (SVG bars), daily accuracy (SVG line), new/learning/mature card counts. Linked from /learn.
- /learn/cards: search, filter by deck, edit (front/back/deck), delete with confirm, import CSV/TSV (Anki-style, skips duplicates, validates subject), export TSV/CSV of the shown cards via saveFile.
## In progress
- Card preview UI after make-cards, optional daily reminder.
## Needs from others
- AI-5: a "Make flashcards" button on the answer page should link to `/learn/cards/new?answer=<id>` (route coming from me next) so users can preview then save cards.
- AI-1/AI-5: a shared Markdown+KaTeX renderer component would let cards show math. Card text is plain text for now.
- AI-2: generateQuiz is a stub; I will build the local fallback so quiz works offline regardless.
## Notes for the manager
- Quiz uses QuizItem from src/types.ts. Timed mode = 1 minute per question; unanswered items count as wrong at time-up.
- Interval is in days; Again relearns in 10 minutes; ease floor 1.3; streak survives until end of the next local day.
