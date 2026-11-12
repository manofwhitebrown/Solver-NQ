## Done
- Provider layer (`src/lib/ai/providers`): Anthropic (browser-access header + version), OpenAI-compatible (base URL, also OpenRouter/Groq/Ollama; key optional with a custom base URL), Gemini, and proxy mode (no key sent).
- Optional Vercel proxy `api/ask.ts` (server-side `AI_API_KEY`, per-IP rate limit, setup in header comment).
- Prompts: one file per subject (9) + learn/answer modes, follow-up, cards, quiz, similar-problem prompts.
- Robust parser (fences, chatter, trailing commas, array support, raw-text fallback) and cache hash (normalise + subject + mode).
- Engine: `askQuestion` (cache -> network -> save question+answer -> cache), offline queue, `flushPending` (runs on app start and on the `online` event, toast per answer), `followUp`, `generateCards`, `generateQuiz`, `similarProblem`. Per-answer conversation history is kept in memory and rebuilt from the saved answer after a reload.
- Errors: friendly messages for missing/bad key, rate limit, timeout, offline, CORS, bad model. Keys, headers and bodies are never logged. Cancel via AbortSignal.
- Ask screen at `/`: text area, subject chips, Learn/Answer toggle, Scan slot, Send, Ctrl/Cmd+Enter, loading state with Cancel, "queued" message, recent questions.
- 20 Vitest tests (parser, hash, errors, engine with fake db/fetch: save, cache hit, offline queue + flush, bad key). Typecheck, build, tests green; my files lint-clean.
## In progress
- Nothing. Not yet tested with a real key (no key available to me); please test once in Settings.
## Needs from others
- AI-4: export `ScanButton` from `@/features/scan` and tell me its props (ideally `onResult({ text, imageDataUrl })`). Until then `src/features/ask/ScanSlot.tsx` is a link to `/scan`; that is the only file to change.
- AI-5: `followUp` returns the new Step but does NOT save it to the answer. Please append it and call `saveAnswer` in the answer view. `verify` is not called by the engine; answers are saved as `verified: 'unchecked'`, so call it from the answer view.
- AI-7: `generateCards` returns `{front, back}` only; use `makeCardsFromAnswer` / `putCard` to store them. `generateQuiz` returns `QuizItem[]` (uses `listLibrary` to find the answers).
- AI-1 (FYI): lint reports ~15 `no-explicit-any` / `no-useless-escape` errors in other owners' files (tts.ts, srs tests, db). Not mine, not touched.
## Notes for the manager
- Queueing: only offline and timeout failures are queued. CORS errors are shown to the user (with the "use Android app or set a Proxy URL" hint) instead of being queued, because retrying would fail forever.
- Cached answers are not used when an image is attached (the text alone is not the key). Cache and history are keyed by subject + mode + normalised text.
- If the model rejects an image, the call is retried once with the OCR text only.
- Hash is a small sync cyrb53 (cache key only, not security).
- Proxy request body: `{ provider, model, system, messages, imageDataUrl }`, response `{ text }`. AI-8: please mention `api/ask.ts` and the env vars (`AI_API_KEY`, optional `AI_PROVIDER`, `AI_BASE_URL`) in the README.
- Reminder: the push token was in a task file; revoke and rotate it when the work is finished.
