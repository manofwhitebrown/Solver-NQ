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
