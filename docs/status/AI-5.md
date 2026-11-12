## Done
- Cloned repo; main has only README and docs, no scaffold yet.
- `verify()` implemented in src/lib/verify (pushed) (19 Vitest cases passing: arithmetic, equations, derivatives, integrals, division by zero, multiple roots, extraneous roots, units, rounding).
- `src/lib/tts.ts`: speak-math, sentence chunking, pause/resume/stop/speed; web speechSynthesis or Capacitor TextToSpeech plugin (pushed)
- `/graph`: own SVG plotter, pan/pinch/wheel zoom, up to 5 functions, zeros + intersections, `?f=` prefill (pushed)
- `/answer/:id` (lazy route): markdown + KaTeX (bundled, offline) + highlighted code with Copy; final answer card; Learn-mode reveal with try-this prompt and Show everything; chips (Explain simpler / Another method / Similar practice problem); follow-up chat (side panel >=1024px, bottom sheet on phone); toolbar (star, tags, flashcards (opens AI-7's /learn/cards/new?answer=<id> preview), export, read aloud with pause/stop/speed, share, copy, Graph this); skeleton, error+Retry, queued states; honest verify badge
## In progress
- Waiting for the manager's phone-layout audit; will fix whatever it reports.
## Needs from others
- AI-7: a shared renderer exists: `Markdown` in `src/features/answer/Markdown.tsx` (KaTeX + code). Import it lazily (`lazy(() => import('@/features/answer/Markdown'))` needs a default or wrapper) so KaTeX stays out of the main bundle.
- AI-2: Ask screen could prefill its text box from `/?text=...` (the Similar practice problem card links there).
- AI-8: precache KaTeX font files (woff2) in the service worker so math looks right offline on first open.
## Notes for the manager
- Learn mode hides the final answer card behind 'Reveal answer' until all steps are shown (still at the top, as specced). Answer mode shows it at once.
- Follow-up replies are saved onto the answer as extra steps with ids starting `fu-`, so exports and the library include them and Learn mode never hides them.
- Fixed the tts.ts lint error that blocked the Pages deploy (0e04db5). AI-2's two requests (save follow-up steps, call verify) were already done in the answer view.
- Answer route id = answer id; Export link uses the question id (`/export?ids=<questionId>`) because loadItems() keys by question.
- Queued state: shown when the answer id is not saved yet and the pending queue is non-empty; it re-checks every 3s.
- AI-8: Android read-aloud needs the `@capacitor-community/text-to-speech` plugin installed and synced. tts.ts looks it up at runtime via Capacitor.Plugins.TextToSpeech and falls back to the web voice, so nothing breaks without it.
- verify only returns `match` when claimed solutions satisfy the equation AND no other root is found by sampling in [-1000, 1000]; word problems, units, systems, inequalities and ambiguous `log` return `unchecked`.
- mathjs runs with the dangerous functions disabled and complex results turned into NaN.
