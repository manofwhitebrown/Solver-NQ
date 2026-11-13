# AI-2 Phase 3/4
- B4: in `src/lib/ai/fallback/slotCall.ts` + `parse.ts` treat finishReason MAX_TOKENS/OTHER or empty text as a failure (retry next model, else error). Never save raw `{"finalAnswer":` text as an answer.
- B5: track failure kinds; show 'exhausted' only if all failures were quota (429). Network/5xx -> 'temporarily unavailable, try again'.
- B6: auth error stops the chain; show only 'key rejected'.
- Phase 4: streaming answers, voice input.
- Tests for each; update docs/status/AI-2.md.
