## Round 3 (13 Nov 2026): AI-2's leftovers finished by AI-4 at the user's request (commits "[AI-2] ...")
### Done (ran on the rebased tree: typecheck, lint, 477 tests / 67 files, `npm run e2e` 15/15)
- **Streaming answers (engine side).** `askQuestion(input, signal, { onPartial })` and `runModel(..., { onPartial })`. With `onPartial` set, Gemini calls use `streamGenerateContent?alt=sse`; without it nothing changes (`generateContent`). `onPartial(textSoFar)` gets the whole text so far, and `''` whenever an attempt starts over (a stream cut off half way falls to the next model and the screen restarts from empty). The finished stream goes through the same checks as a whole reply: empty, cut-off (`finishReason` other than STOP) and safety-blocked streams are never saved as answers. Same 4-call cap, same cooldown rules, key never in errors (tests). `previewAnswer(raw)` (exported from `@/lib/ai`) turns the half-written JSON into `{ finalAnswer, steps, summary }` so the screen can show steps as they arrive; the saved answer still comes from `parseAnswer` on the finished text. 12 new tests (`__tests__/stream.test.ts`) use a fake streaming `Response` that splits lines across network pieces.
  - **Not done / limits:** streaming is Gemini only (OpenAI-compatible, Anthropic and proxy mode still answer in one piece). An identical double-tapped question shares one call, so only the first caller gets partial text. **Not run against the real Gemini API.**
- **Voice input (Ask).** New `src/lib/ai/voice/`: `startVoice()` (browser Web Speech API on web; `@capacitor-community/speech-recognition` 7.0.1 on Android, loaded on demand, partial results, no popup), `useVoiceInput(getText, setText)` hook, `<VoiceButton listening onToggle />` (48 px, `aria-pressed`, named "Speak your question" / "Stop listening"). The words are added after what is already typed as they are heard. **It never sends**: nothing in this folder calls `askQuestion`. Plain messages for denied microphone, no speech heard, offline, no microphone, unsupported. 7 tests with a fake recogniser and a fake plugin (permission prompt, partial results, final text once, refused permission, failed start).
  - Plugin added exact-pinned (own commit, same pattern as AI-4's TTS plugin): `package.json`, lockfile, and the three gradle lines from `npx cap sync android` (`android/app/capacitor.build.gradle`, `android/capacitor.settings.gradle`). The plugin's own manifest brings `RECORD_AUDIO` and the `RecognitionService` query. **AI-8: please pull before touching those gradle files and check the APK build.**
  - **Not verified:** nobody has run voice on a phone or in a real browser. Chrome/Edge/Safari send the audio to their own speech service (needs a connection; Firefox has no Web Speech API, so the button simply does not show there).
### Needs from others
- **AI-7 (owns `src/features/ask/*` until "ASK DONE"; I did not touch it):** (1) mount the mic: `const v = useVoiceInput(() => text, setText); {v.supported && <VoiceButton listening={v.listening} onToggle={v.toggle} />}` next to Scan/Send (`import { useVoiceInput, VoiceButton } from '@/lib/ai/voice'`), and show `v.error` as a `role="alert"` line. (2) streaming: pass `{ onPartial: t => setPreview(previewAnswer(t)) }` as the third argument of `askQuestion` in `useAsk`, and render the preview in the Thinking card (clear it when the call ends or fails). Both are optional: the app works exactly as before until you wire them.
- **AI-8:** build the APK from this commit and add "Voice input" to `docs/DEVICE-TEST.md` (steps below).
### Real-phone steps for voice (Android only; not verified by me)
1. Install the APK. Open Ask. (Needs the mic button wired by AI-7, see above.)
2. Tap the microphone. First time: the phone asks to allow the microphone: tap Allow. Expect the button to turn red with a stop square.
3. Say "solve two x plus five equals seventeen". Expect words to appear in the box while you speak; nothing is sent.
4. Tap the button again (or stop talking). Expect the box to keep the text and the button to return to a microphone. Edit the text if needed and press Send yourself.
5. Type "Solve" first, then use the microphone: the spoken words come after "Solve" with one space.
6. Deny the microphone (system settings > Apps > Solver-NQ > Permissions) and tap the button: expect a message saying how to allow it.
7. Airplane mode: tap the button. Expect either the offline message or no text, never a crash or a sent question.

## Round 13 Nov 2026 (R7, R2, R3, R4, R5)
### Done (each one ran: typecheck, lint, 90 AI unit tests / 415 total, `npm run e2e` 15/15, all run on the rebased tree)
- **R7** `scripts/gemini-smoke.mjs` (Node 22): `GEMINI_API_KEY=... node scripts/gemini-smoke.mjs`. Does ListModels, then one tiny text call and one tiny image call (a generated 64x64 red PNG) per default-chain model, plus one probe on a model name that does not exist. Prints model, HTTP status, finishReason, latency, characters, token counts (incl. thinking tokens), and how the app treats it (`classify()` for errors; "incomplete" for cut-off or empty). Never prints the key (read from the environment, scrubbed from any text). Optional: `GEMINI_MODELS=a,b` to test chosen models, `SMOKE_MAX_TOKENS=256`. **Only run against a local fake Gemini server (it flagged a simulated MAX_TOKENS call and a 404 correctly). It has NOT been run against the real Google API: the user runs it once and pastes the output; budgets/parsing get adjusted from that.**
- **R2** `transcribeImage` rejects a refusal ("I'm sorry", "I can't", "I cannot", "As an AI", "I'm unable", ...) when the reply has no digits or maths symbols, and throws `AiError('image_refused')`: "The AI would not read this picture. Type the question instead." ScanPage already keeps the OCR text and shows `e.message`, so no change was needed there. Tests: 5 refusals rejected, 5 real questions starting with those words still pass.
- **R3** New codes `cut_off` ("The reply was cut off. Try again, or ask a shorter question.") and `empty` ("The AI sent nothing back. Try again."), used by the fallback chain, `transformText`, `transcribeImage` and `answerNow`. A cut-off or empty reply no longer parks the model (no cooldown is written); the next model is tried at once instead of retrying the same one.
- **R4** `MAX_CALLS_PER_QUESTION = 4` across all models and keys, single pass only. The one quick retry of a network/5xx blip now happens only on the question's first call. 500 everywhere or network down: exactly 4 calls (tests for both).
- **R5 (my half)** `ModelSlot.verified`. Guessed names in `SUGGESTED_MODELS` and a migrated user's own model are `verified: false`; `verifiedFirst()` makes them rank after any verified model (also used by `getPrimaryModel()`). Retired names (`gemini-1.*`, `gemini-2.0*`) are not carried over on migration. Once per session, before the first real call, `verifyChain()` asks ListModels (not a generateContent call, 5 s limit): listed names become verified, unlisted guesses are removed, an empty or failed answer changes nothing. Models added from a fetched list are verified.
### Needs from others
- **AI-1:** none now. AI-1 already emptied the Gemini default in `settings.ts` and dropped `gemini-2.0-flash` in `store.ts`; I merged my version on top (retired names via `isRetiredModel`, own model kept as unverified). Optional: show an "unverified" tag next to slots with `verified === false` in the chain list.
- **AI-3:** `src/features/library/rows.perf.test.tsx` is timing-sensitive (207 ms vs the 200 ms limit on a slow machine in one full run; passes alone).
### Not done yet
- (6) support for AI-7's Home/Ask thinking/queued/error states; (7) voice input on Ask, then streaming answers.
### Notes for the manager
- Every error on the Ask screen now has its own wording; `retryable` is still only offline/timeout/exhausted, so cut-off and empty are shown, not queued.
- The R5 migration rule "keep own choice only if it appears in ListModels" is done by marking it unverified and pruning on the first ListModels check, because migration itself runs without a network.

## Round 2 (13 Nov 2026, phase6-leftovers)
### Done
- R7: `scripts/gemini-smoke.mjs` written. Run: `GEMINI_API_KEY=... node scripts/gemini-smoke.mjs` (Node 22). ListModels, then one tiny text and one tiny image call per slot of the app's default chain (override with `GEMINI_MODELS=a,b`), plus a probe with a non-existent model. Prints model, HTTP status, finishReason, latency, characters, token counts (including thinking tokens) and how `classify()` / the app treats each result. The key is read from the environment only and scrubbed from all output.
- Checked only against a local fake Gemini server (STOP, MAX_TOKENS with empty text, 429 daily quota, 404 all classified as expected; the key appeared 0 times in the output). NOT yet run against the real API: waiting for the user's output.
### Next
- R2, R3, R4, R5, then AI-7 states, voice input, streaming. Budgets/parsing get adjusted after the real smoke output is pasted.

## Phase 2 (AI-2)
### Done (P0)
- `AddKeyForm` (`@/features/ai-settings`): paste Gemini key, Test key, Save key; after the first save it fetches the models Google really offers and pre-fills the chain.
- `src/lib/ai/fallback/`: persisted state (localStorage `solvernq.ai.v2`) that migrates the old provider/model/apiKey/baseUrl on first load and imports a key later pasted in the old Settings field; `callWithFallback` (429 -> cooldown with retryDelay, daily quota -> midnight Pacific, 5xx/network -> one retry then 30 s cooldown, 404/limit 0 -> unavailable, 400/401/403 -> key invalid with no blind fall-through, safety block -> shown); key rotation within a model; keys with the same project label share one quota; token-bucket throttle and in-flight de-duplication; Save-quota mode (light models first, used by cards/quiz/similar); proxy mode unchanged.
- When every slot is exhausted the question is queued with a retry time and answered automatically when the first cooldown ends (timer) or the app comes back online. The Ask card says "all free limits are used up ... about HH:MM".
- `getPrimaryModel()` exported from `@/lib/ai` and `@/lib/ai/fallback`. `Answer.model` still records the model that answered.
- `<AiSettingsPanel />` exported from `@/features/ai-settings`: key list (masked, delete), editable chain (toggle, up/down, per-slot status Ready / Cooling down until HH:MM / Unavailable / Key invalid, Test, Remove), Fetch available models with tick-to-add, Save quota, Reset cooldowns, free-tier notice, How to get a free key.
- Ask shows a "Add your free key to start" card when there is no key.
- 20 new tests (mocked fetch): every failure class, rotation, same-project quota, cooldown persistence across reload, exhausted -> queued -> flushed, no key in errors or logs, ranking, migration.
### Done (P1 item 6) - AVAILABLE NOW for AI-4 and AI-7
- `import { transformText, transcribeImage } from '@/lib/ai'`.
- `transformText(kind: 'summary' | 'cheatsheet' | 'keyterms' | 'qa-from-text', text, opts?: { language?, maxItems? }, signal?) => Promise<string>` (Markdown), through the fallback chain.
- `transcribeImage(imageDataUrl, signal?) => Promise<string>` (formulas as LaTeX in $...$). Only vision-capable models are used: a model that rejects images is skipped, never silently answered without the image. Throws AiError (`no_key`, `exhausted` with `retryAt`, etc.): show `e.message`.
### Done (P1 items 7-8, layout pass)
- Ask screen v2 on `Page`/`PageHeader`/`Section`/`Stack`/`Card` (no own padding): hero input card (textarea, image preview, Scan + Send), subject chips in one scroll-snap row with edge fade and 44 px chips, Learn/Answer toggle with a one-line explanation ("Teach me" / "Just solve"), Ctrl+Enter hint only on mouse devices, roomy Recent list (rows >= 64 px).
- Status line under Send: when the first-choice model is cooling down or unavailable it says which model rests and that the next one will answer. (The "Answered by <model>" label after an answer is AI-5's.)
- NOT checked visually: `npm run shots` does not exist yet (AI-3), so no screenshots or 320 px check from me. Please review `/` at 320 and 390 px once the shots tool lands.
### Remaining
- P2: streaming, remove `any`, share logic in `api/ask.ts`.
### Needs from others
- AI-1: mount `<AiSettingsPanel />` in Settings (and use `<AddKeyForm showLabel={false} />` in onboarding). The old Provider/Model/API key fields in Settings are now only a one-time import; please remove or hide them once the panel is mounted. Settings can keep the Proxy URL field.
- AI-5: use `getPrimaryModel()` from `@/lib/ai`: show "Answered by <model>" when `answer.model !== getPrimaryModel()`.
### Notes for the manager
- Model names in the suggested chain (gemini-3.8-flash, 3.6-flash, 3.5-flash-lite, 3.1-flash-lite, 2.5-flash-lite) come from third-party pages dated Oct-Nov 2026, not from Google directly; gemini-2.0-flash was shut down in June 2026. They are only a starting point: Fetch available models replaces them with what Google lists for the user's key.
- Not tested against the real Gemini API (no key here).
### Manual tests for the user
0. Open `/` at 320 px wide (browser devtools): chips row scrolls and fades at the edges, Send is easy to reach, nothing overflows sideways.
1. Settings or onboarding: paste a real free Gemini key, tap Test key (expect "Key works"), Save key. The model chain should fill with models available to you.
2. Ask a question. An answer should open. Check the chain shows the first model as Ready.
3. In the model chain, add a fake model (or move one you know is unavailable) to the top; ask again. It should still answer from the next model and mark the first Unavailable or Cooling down.
4. Airplane mode, ask something new: it should say it is saved. Turn the connection back on: the answer should appear in the library.
5. Add a wrong key and ask: you should see "Your AI key was rejected" and the key marked as rejected.

## Done
- Provider layer (`src/lib/ai/providers`): Anthropic (browser-access header + version), OpenAI-compatible (base URL, also OpenRouter/Groq/Ollama; key optional with a custom base URL), Gemini, and proxy mode (no key sent).
- Optional Vercel proxy `api/ask.ts` (server-side `AI_API_KEY`, per-IP rate limit, setup in header comment).
- Prompts: one file per subject (9) + learn/answer modes, follow-up, cards, quiz, similar-problem prompts.
- Robust parser (fences, chatter, trailing commas, array support, raw-text fallback) and cache hash (normalise + subject + mode).
- Engine: `askQuestion` (cache -> network -> save question+answer -> cache), offline queue, `flushPending` (runs on app start and on the `online` event, toast per answer), `followUp`, `generateCards`, `generateQuiz`, `similarProblem`. Per-answer conversation history is kept in memory and rebuilt from the saved answer after a reload.
- Errors: friendly messages for missing/bad key, rate limit, timeout, offline, CORS, bad model. Keys, headers and bodies are never logged. Cancel via AbortSignal.
- Ask screen at `/`: text area, subject chips, Learn/Answer toggle, real `ScanButton` (AI-4) with prefill from /scan router state and a photo preview, image-only questions, Send, Ctrl/Cmd+Enter, loading state with Cancel, "queued" message, recent questions.
- Integration test with the real db (fake-indexeddb) + fake network: ask -> save -> follow-up / cards / quiz / similar; cache hit offline; offline queue -> flush. It found and I fixed one bug: offline asks used to try the network before queueing; now they check the cache and queue immediately.
- 24 Vitest tests (parser, hash, errors, engine with fake db/fetch: save, cache hit, offline queue + flush, bad key). Typecheck, build, tests green; my files lint-clean.
- Ask prefill from `/?text=...&subject=...` (AI-5's "Solve it" link): capped at 4000 chars, subject validated, never auto-sends. Unit-tested.
## In progress
- Nothing. Not yet tested with a real key (no key available to me); please test once in Settings.
## Needs from others
- (none right now. AI-5 already saves follow-up steps and calls verify; AI-4 ScanButton is wired.)
- AI-7: `generateCards` returns `{front, back}` only; use `makeCardsFromAnswer` / `putCard` to store them. `generateQuiz` returns `QuizItem[]` (uses `listLibrary` to find the answers).
- AI-1 (FYI): lint reports ~15 `no-explicit-any` / `no-useless-escape` errors in other owners' files (tts.ts, srs tests, db). Not mine, not touched.
## Notes for the manager
- Scan hand-off works as AI-4 built it: /scan navigates to `/` with `{ text, imageDataUrl }` in router state; Ask reads it once and clears it. An image with no text is sent with a default instruction (providers reject empty text) and is never cached.
- Queueing: only offline and timeout failures are queued. CORS errors are shown to the user (with the "use Android app or set a Proxy URL" hint) instead of being queued, because retrying would fail forever.
- Cached answers are not used when an image is attached (the text alone is not the key). Cache and history are keyed by subject + mode + normalised text.
- If the model rejects an image, the call is retried once with the OCR text only.
- Hash is a small sync cyrb53 (cache key only, not security).
- Proxy request body: `{ provider, model, system, messages, imageDataUrl }`, response `{ text }`. AI-8: please mention `api/ask.ts` and the env vars (`AI_API_KEY`, optional `AI_PROVIDER`, `AI_BASE_URL`) in the README.
- Reminder: the push token was in a task file; revoke and rotate it when the work is finished.
