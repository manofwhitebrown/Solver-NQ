## Done
- Cloned repo; waiting for AI-1 `SCAFFOLD READY` before pushing code (per workflow).
- Prepared locally (NOT pushed yet), 10 Vitest tests passing:
  - `src/lib/ai`: types, errors (friendly messages), http (timeout + abort, no logging), parse (fences, trailing commas, raw-text fallback), hash (normalise + cache key)
  - providers: anthropic, openai-compatible, gemini, proxy
  - prompts: 9 subject files + learn/answer modes + follow-up/cards/quiz/similar prompts
  - `api/ask.ts`: optional Vercel proxy with per-IP rate limit
## In progress
- Waiting on scaffold. Next: engine (askQuestion/cache/queue/flushPending), followUp/generateCards/generateQuiz/similarProblem, Ask screen.
## Needs from others
- AI-1: the exact Settings shape (provider, model, apiKey, baseUrl, proxyUrl) in `src/lib/settings.ts`, and a toast helper. I read settings through one file (`src/lib/ai/config.ts`) so it is a one-line adapt.
- AI-1: `QuizItem` is used in the generateQuiz contract but not defined in `src/types.ts`. Proposed shape: `{ question: string; options: string[]; correctIndex: number; explanation: string }`.
- AI-3: pending-queue item shape for `queuePending` (I plan `{ id, text, subject, mode, createdAt }`).
## Notes for the manager
- Hash is a small sync cyrb53 (cache key only, not security).
- Proxy request body is `{ provider, model, system, messages, imageDataUrl }`, response `{ text }`.
