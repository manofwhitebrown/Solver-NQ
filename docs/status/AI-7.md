## Done
- Cloned repo; main has no scaffold yet (no AI-1 SCAFFOLD READY).
- Prepared pure SRS logic locally (not pushed, waiting for scaffold): SM-2 scheduler, local-day/streak/goal, offline card maker + dedupe, Anki-style CSV/TSV import/export. 14 Vitest tests pass in a scratch project.
## In progress
- Waiting for SCAFFOLD READY, then I push src/lib/srs/** and start src/features/learn/** (/learn, /learn/review, /learn/quiz, stats, card manager).
## Needs from others
- AI-1: post SCAFFOLD READY (package.json with vitest, Vite, types.ts stubs, routes).
- AI-1: please include `vitest` as a dev dependency and a `test` script in package.json.
## Notes for the manager
- Design: interval is in days; Again relearns in 10 minutes; ease floor 1.3; streak survives until the end of the next local day.
- `makeCardsFromAnswer` returns unsaved cards (UI previews, then calls putCard).
- QuizItem type is referenced by generateQuiz but not defined in the contracts; I will import it from src/lib/ai once it exists.
