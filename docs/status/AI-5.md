## Done (Phase 2)
- P0: `mathToPlain` in `src/features/answer/plainText.ts`, re-exported from `src/features/answer/index.ts`; 25 unit tests.
## In progress
- P1: verify honesty review: 42 new cases in `verify.honesty.test.ts` (word problems, units, equivalent forms, rounding, trig degrees/radians, undefined, systems, inequalities). Fixed a real bug: `sin(30)` with no unit was called `mismatch`; now `unchecked` unless degrees/radians/pi is stated (degrees converted). Badge copy: mismatch now reads "Doesn't match - double-check"; Checked tooltip says the method is not checked. Not parsed (stay `unchecked`, safe): `x ∈ {..}` sets, "to 2 decimal places" suffix.
- P0: "Answered by <model>" line (`ModelLabel.tsx`); reads `getPrimaryModel` from `@/lib/ai` if it exists and shows a soft chip for backup models. Queued copy now says it answers when online or free quota resets.
## Remaining
- P0: "Retry with best model" button is built into `ModelLabel` (`onRetry`) but not wired: needs AI-2 to export `getPrimaryModel()` AND a way to make `askQuestion` skip the cache (e.g. `{ skipCache: true }`). Then I pass `onRetry` in AnswerPage.
P1: Answer v2 layout, bottom action bar, Learn polish, Graph v2, question card collapse (after `DESIGN V2 READY`). P2: TTS cleanup, remove `any`.
## Needs from others
- AI-2: export `getPrimaryModel()` and an `askQuestion` option to skip the cache.
- AI-3: `scale.test.ts` (2000 items) is timing-based and failed once on a slow sandbox. AI-8: `docs/audit/tools/layout-audit.mjs` has lint errors (`process`, `indexedDB` undefined; needs node globals in ESLint config).
## Notes for the manager
- No browser in my environment: nothing visually verified yet.
## Manual tests for the user
- (Phase 2 list will grow as items land.) Open a saved answer in Learn mode, reveal steps, read aloud, follow-up, flashcards, export; check a long equation does not break the layout.
## Phase 1 notes (kept)
### Done
- Cloned repo; main has only README and docs, no scaffold yet.
- `verify()` implemented in src/lib/verify (pushed) (19 Vitest cases passing: arithmetic, equations, derivatives, integrals, division by zero, multiple roots, extraneous roots, units, rounding).
- `src/lib/tts.ts`: speak-math, sentence chunking, pause/resume/stop/speed; web speechSynthesis or Capacitor TextToSpeech plugin (pushed)
- `/graph`: own SVG plotter, pan/pinch/wheel zoom, up to 5 functions, zeros + intersections, `?f=` prefill (pushed)
- `/answer/:id` (lazy route): markdown + KaTeX (bundled, offline) + highlighted code with Copy; final answer card; Learn-mode reveal with try-this prompt and Show everything; chips (Explain simpler / Another method / Similar practice problem); follow-up chat (side panel >=1024px, bottom sheet on phone); toolbar (star, tags, flashcards (opens AI-7's /learn/cards/new?answer=<id> preview), export, read aloud with pause/stop/speed, share, copy, Graph this); skeleton, error+Retry, queued states; honest verify badge
### In progress
- Waiting for the manager's phone-layout audit; will fix whatever it reports.
- Note: I have no browser in my sandbox, so nothing has been seen on a real screen yet (only code-audited: all my chips and buttons are now >=44px). Please eyeball /answer/:id and /graph on a phone width.
### Needs from others
- AI-7: a shared renderer exists: `Markdown` in `src/features/answer/Markdown.tsx` (KaTeX + code). Import it lazily (`lazy(() => import('@/features/answer/Markdown'))` needs a default or wrapper) so KaTeX stays out of the main bundle.
- AI-2: Ask screen could prefill its text box from `/?text=...` (the Similar practice problem card links there).
- AI-8: precache KaTeX font files (woff2) in the service worker so math looks right offline on first open.
### Notes for the manager
- Learn mode hides the final answer card behind 'Reveal answer' until all steps are shown (still at the top, as specced). Answer mode shows it at once.
- Follow-up replies are saved onto the answer as extra steps with ids starting `fu-`, so exports and the library include them and Learn mode never hides them.
- Fixed the tts.ts lint error that blocked the Pages deploy (0e04db5). AI-2's two requests (save follow-up steps, call verify) were already done in the answer view.
- Answer route id = answer id; Export link uses the question id (`/export?ids=<questionId>`) because loadItems() keys by question.
- Queued state: shown when the answer id is not saved yet and the pending queue is non-empty; it re-checks every 3s.
- AI-8: Android read-aloud needs the `@capacitor-community/text-to-speech` plugin installed and synced. tts.ts looks it up at runtime via Capacitor.Plugins.TextToSpeech and falls back to the web voice, so nothing breaks without it.
- verify only returns `match` when claimed solutions satisfy the equation AND no other root is found by sampling in [-1000, 1000]; word problems, units, systems, inequalities and ambiguous `log` return `unchecked`.
- mathjs runs with the dangerous functions disabled and complex results turned into NaN.
