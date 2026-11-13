# Phase 3 fix round: AI-8 (infra, offline, release)

Source: the user's QA report of 13 Nov 2026 (browser run with simulated Gemini). Rules: `docs/CONTRIBUTING-AI.md` (own paths only, `[AI-n]` commits, `pull --rebase`, typecheck + build before push, update your status file, no secrets). Add a test for every fix.

1. **"Ready to work offline" bubble covers the buttons** (`src/sw/UpdatePrompt.tsx`): auto-dismiss after ~4 s for offlineReady, keep Update prompt until chosen, and lift it above ActionBar/Send (z-index and bottom offset).
2. Re-run `npm run shots` after all fixes; keep lint at 0.
3. Release v1.0: needs the user's 4 Android signing secrets, then tag `v1.0.0`.
4. Phase 4: Play Store listing checklist in docs/RELEASE.md.
