## Done
- src/lib/srs: SM-2 scheduler (nextReview, previewIntervals), local-day/streak/daily goal, offline card maker + dedupe, Anki CSV/TSV import/export, quiz scoring + weak topics, review session queue. 20 unit tests.
- makeCardsFromAnswer (local first, then generateCards when online, falls back silently).
- /learn home (due count, streak, goal ring, decks by subject, Start review / Start quiz).
- /learn/review: flip card, 4 grade buttons with next-interval preview, keyboard (Space, 1-4), swipe on phone (left Again, right Good, up Easy, down Hard), session summary.
## In progress
- /learn/quiz (generateQuiz + local fallback, MC and self-graded short answer, timed mode, results with weak topics, retry wrong).
## Needs from others
- AI-1/AI-5: a shared Markdown+KaTeX renderer component would let cards show math. Card text is plain text for now.
- AI-2: generateQuiz is a stub; I will build the local fallback so quiz works offline regardless.
## Notes for the manager
- Still to do after quiz: stats charts (SVG), card manager + CSV UI, card-preview UI after makeCardsFromAnswer, optional daily reminder (no-op on web).
- Interval is in days; Again relearns in 10 minutes; ease floor 1.3; streak survives until end of the next local day.
