# Phase 3 fix round (from the independent scan-bug report, 13 Nov 2026)

Rules: same as `docs/CONTRIBUTING-AI.md`. Own paths only, `[AI-n]` commit prefix, `git pull --rebase` before push, `npm run typecheck && npm run lint && npx vitest run` before every push, update `docs/status/AI-n.md`. Never commit tokens.

| # | Bug | Owner | State |
|---|---|---|---|
| 1 | Crop box started 5% inset and chopped first/last letters | AI-4 | FIXED by AI-1 (`FULL` rect is now 0,0,1,1). AI-4: add a unit/e2e test and check Enhance + rotate keep the full rect |
| 2 | Scan "Ask" only filled the Ask box | AI-4 + AI-2 | FIXED by AI-1 (`autoSend` in router state; AskPage sends, restores text on failure). AI-2: add a test for the hand-off |
| 3 | "Ready to work offline" bubble covered buttons | AI-8 | FIXED by AI-1 (top of screen, auto-dismiss 4 s). AI-8: confirm in the real PWA build |
| 4 | Cut-off / empty AI reply saved as an answer; same for "Read with AI" | AI-2 | FIXED by AI-1 (Gemini `finishReason` check, `incomplete` failure, blank-answer guard, empty transcription error). AI-2: also check `openai.ts` / `anthropic.ts` stop reasons (`length`, `max_tokens`) and add tests |
| 5 | Server/network failures reported as "limits used up" | AI-2 | FIXED by AI-1 (`sawQuota` / `sawServer`). AI-2: add tests for 5xx x all models -> "server" message |
| 6 | Bad key + "next model will answer" | AI-2 | FIXED by AI-1 (`FallbackNote` hides on `key-invalid`) |
| 7a | Text links 19 px tall | AI-5 / AI-7 | FIXED by AI-1 (links `inline-flex` around 44 px buttons; AnswerPage link 44 px). Owners: re-run `npm run shots` a11y check |
| 7b | Wrong file type on scan page showed no detectable message | AI-4 | OPEN: verify the toast is shown for `.txt`, empty-type and HEIC files via the file picker (the `pick` path), make it persistent (inline message), add a test |

Still needs a real phone (nobody here can verify): real Gemini, camera, ML Kit OCR, handwriting. See `docs/DEVICE-TEST.md`.
