## Design v3: Answer view + navigation (13 Nov 2026, ran on this commit)
- Done: final answer is now the hero card (brand bar, check badge, maths 1.2em, `prose-final`); numbered step badges use `brand-grad` (36 px); subject is a pill on the question card; verify badge is a pill (`ok-soft` for Checked, `bad-soft` alert for mismatch, quiet `raised` pill when unchecked; wording unchanged and still honest); follow-up side panel has a header and one-line hint; tab bar active pill and side nav got press/hover states (`src/app/Layout.tsx`, no size or behaviour change). Tokens and primitives only, no new colours or shadows.
- Fixed real axe findings on all 6 answer routes (was 6 routes with `serious` violations, now 0): phone bar buttons now use their visible text as name (`label-content-name-mismatch`); wide display equations and code blocks are keyboard-focusable scroll regions (`scrollable-region-focusable`, new `rehypeFocusableMath.ts` plus a test).
- Checked by running: `npm run typecheck`, `npm run lint`, `npm test` (389 pass), `npm run e2e` (15/15), `npm run shots -- /answer` (layout audit: no findings at 390, 1280 and the extra widths 320/360/375/412/430/640x360, light; axe: 0 violations). I looked at the phone light and laptop dark screenshots myself.
- Verified later in a real browser (own puppeteer run against the demo build): 320, 360 and 430 px, light and dark, on the learn, wide-math, mismatch and code answers: no sideways scroll, no button or link under 44 px in either dimension. Looked at 320 dark (wide-math) and 320 light (incomplete). The incomplete-answer screen shows its text and "Ask again"; its icon was a check mark (read as success), now a warning icon. Not looked at: 360/430 screenshots by eye, and the tab bar on routes other than Answer (the tab bar is hidden on /answer by design).
- Not touched: tables. `react-markdown` has no GFM plugin here, so pipe tables are not rendered as tables at all (pre-existing; needs `remark-gfm`, a new dependency, so not done).

## Phase 4: tablet two-pane (PROPOSAL, nothing pushed, waiting for AI-1)
Needs one new layout primitive in `src/components/ui/layout.tsx` (AI-1's file). Proposed API:
`<TwoPane list={<LibraryList/>} detail={<Outlet/>} hasDetail={boolean} />`
- Below 768 px it renders ONLY `detail` if `hasDetail`, else only `list`. That is exactly today's phone behaviour, so phone layouts do not change.
- From 768 px: CSS grid `grid-cols-[minmax(280px,360px)_minmax(0,1fr)]`, gap 24 px; each pane scrolls on its own (`min-h-0 overflow-y-auto`, height `100dvh` minus page padding), no page-level sideways scroll.
- Needs from others if approved: AI-3 passes the Library list into `list` and makes the selected row highlighted; a route `/library/:answerId` (or `?open=<id>`) that opens the answer in the right pane; I make `AnswerPage` embeddable (no own `PageHeader` back button when in a pane, `PhoneBar` stays tied to the window, not the pane). Open question for AI-1: between 768 and 1023 px the tab bar is still shown, so the pane height must subtract `--tabbar-h`.
- I will not push `TwoPane` or touch routes until AI-1 writes APPROVED here or in `docs/status/AI-1.md`.

## Needs from others
- AI-1: approve or change the `TwoPane` proposal above. FYI `ActionBar` uses `lg:left-[264px]` but the side nav is 272 px wide (8 px overlap); not mine, not changed.
- AI-3: please include the Answer routes in your next full `npm run shots` and the before/after in `docs/audit/`.

## Phase 5 design overhaul (13 Nov 2026)
- In progress: foundation (tokens, primitives, shell, Answer). Plan and lanes: `docs/tasks/phase5-design/README.md`. Other AIs: wait for the line `DESIGN V3 READY` here before touching colours.

## Phase 3 fix round (13 Nov 2026)
- Done: Answer view never renders a blank or raw-JSON answer (`incomplete.ts`, `IncompleteState` with Ask again, 4 tests). Added regression tests for the engine fixes AI-1 landed (5xx on every model says "server", cut-off MAX_TOKENS reply moves to the next model, real 429s still say "exhausted").
- Verified on main after AI-1's commit: crop = full image, scan Ask auto-sends, offline bubble at top and auto-dismisses, links 44 px. 368 tests, lint 0, build ok.
- Done (Phase 4): Answer-screen strings scaffold (`strings.ts`, English only, falls back safely; Hindi/Telugu/Urdu need native review). Waiting: tablet two-pane Answer layout needs AI-1's `TwoPane` primitive and manager approval (design freeze).
- Note for the manager: several AIs fixed the same QA bugs at once; `docs/tasks/phase3b/README.md` is the source of truth for bug state.

## Done (Phase 2)
- P0: `mathToPlain` in `src/features/answer/plainText.ts`, re-exported from `src/features/answer/index.ts`; 25 unit tests.
- Seen in a real browser via `npm run shots` (answer learn/answer/wide-math/code/long-word/mismatch, graph) at phone 390 and laptop 1280, light/dark: layout, model chip + Retry, final answer card, step cards, graph legend and zoom buttons all fine. Layout checks: no findings; axe: 0 violations. Screenshots committed in `docs/screenshots/`.

## In progress
- P1: Answer v2 layout (code, not yet seen on a screen): `PageHeader` + Back, `QuestionCard` (18/1.5, collapses >4 lines), accent-soft final answer card, numbered step cards 20 px apart, Learn mode with "Step N of M" progress, try-this callout, reveal animation and `aria-live`; phone `PhoneBar` (Star, Cards, Export, More; labelled, 56 px) + `MoreSheet` (Tags, Read aloud, Share, Copy, Graph this) + full-height `FollowUpSheet`; laptop labelled `Toolbar` + 360 px follow-up panel; distinct icons (download, share-nodes, stacked cards, two sheets). Wide equations scroll in their own box; single-line `$$..$$` is now a real display block (it used to render inline, and an old test hid that). Cross-owner edit: added `'answer/:id'` to `WIDE` in `src/app/routes.ts` so the laptop side panel fits.
- P1: Graph v2 (curve colours now theme-aware CSS vars, lighter in dark mode): `PageHeader`, layout rhythm, legend swatch with colour AND dash style, axis labels 12 px, 44 px "Zeros and intersections" row, +/- zoom buttons (44 px) beside pinch/wheel, fixed-height canvas. `?f=` prefill unchanged.
- P2: TTS: paragraph/step breaks become spoken pauses, reading speed is remembered (localStorage, safe if unavailable); LaTeX already spoken as words. No `any` left in my folders (grep clean). KaTeX and highlight.js stay lazy via the lazy `/answer` route.
- P1: verify honesty review: 42 new cases in `verify.honesty.test.ts` (word problems, units, equivalent forms, rounding, trig degrees/radians, undefined, systems, inequalities). Fixed a real bug: `sin(30)` with no unit was called `mismatch`; now `unchecked` unless degrees/radians/pi is stated (degrees converted). Badge copy: mismatch now reads "Doesn't match - double-check"; Checked tooltip says the method is not checked. Not parsed (stay `unchecked`, safe): `x ∈ {..}` sets, "to 2 decimal places" suffix.
- P0: "Answered by <model>" line (`ModelLabel.tsx`); reads `getPrimaryModel` from `@/lib/ai` if it exists and shows a soft chip for backup models. Queued copy now says it answers when online or free quota resets.
## Remaining
- (done) screenshots of /answer and /graph.
- P0: "Retry with best model" is wired. Cross-owner edit (AI-2, tiny, user approved): `askQuestion(input, signal, { skipCache })` in `src/lib/ai/ask.ts`; the retry opens the new answer (replace) or says the best model is busy.
## Needs from others
- AI-2: FYI I added the optional `skipCache` to `askQuestion`/`answerNow` (3 lines).
- AI-3: `npm run shots` does not exist yet, so I could not produce the /answer and /graph screenshots.
- AI-3: `scale.test.ts` (2000 items) is timing-based and failed once on a slow sandbox. AI-8: `docs/audit/tools/layout-audit.mjs` has lint errors (`process`, `indexedDB` undefined; needs node globals in ESLint config).
## Notes for the manager
- Inline (not display) wide equations inside a paragraph can still overflow; check on a phone.
- No browser in my environment: nothing visually verified yet.
## Manual tests for the user
- Open a saved answer in Learn mode, reveal steps, read aloud, follow-up, flashcards, export; check a long equation does not break the layout. Read aloud twice: speed (tap the x button in More / the toolbar) should persist after a reload and steps should have short pauses. On /graph: both zoom buttons, and that two functions can be told apart by dash style.
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
