# Phase 3 fix round: AI-2 (AI engine, Ask)

Source: the user's QA report of 13 Nov 2026 (browser run with simulated Gemini). Rules: `docs/CONTRIBUTING-AI.md` (own paths only, `[AI-n]` commits, `pull --rebase`, typecheck + build before push, update your status file, no secrets). Add a test for every fix.

1. **Truncated replies saved as answers.** Check the finish reason (Gemini `finishReason`; anything but STOP is a failure, MAX_TOKENS gets one retry with a higher limit). Never show raw `{"finalAnswer":...` text as an answer. An empty reply must be an error, not a blank saved answer.
2. Same check for `transcribeImage` ("Read with AI"): half-finished or empty transcription must raise a clear message.
3. **Wrong quota message.** After retries, only say "free limits used up" when the failures were 429s. Server/network failures must say "AI service had a problem, try again" and keep the question queued.
4. **Bad key:** "Your AI key was rejected" must not also say "the next model will answer". Stop the chain on 401/403 and point to Settings.
5. Ask button flow: Scan now sends `{ text, imageDataUrl }` and the button says "Review in Ask". Optional: accept `autoSend: true` in that router state and submit once (then AI-4 flips the flag on).
6. Phase 4: streaming answers; voice input (Web Speech / Android speech) on the Ask box.
