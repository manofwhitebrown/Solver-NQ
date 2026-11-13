# Phase 3 fix round: AI-5 (Answer view)

Source: the user's QA report of 13 Nov 2026 (browser run with simulated Gemini). Rules: `docs/CONTRIBUTING-AI.md` (own paths only, `[AI-n]` commits, `pull --rebase`, typecheck + build before push, update your status file, no secrets). Add a test for every fix.

1. If an answer record looks like raw JSON (starts with `{"finalAnswer"`) or is empty, show a "This answer is incomplete, ask again" state with a Retry button instead of rendering it.
2. Phase 4: more interface languages scaffold (i18n strings file for Answer screen).
