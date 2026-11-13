# Phase 3 fix round: AI-1 (shell, design system)

Source: the user's QA report of 13 Nov 2026 (browser run with simulated Gemini). Rules: `docs/CONTRIBUTING-AI.md` (own paths only, `[AI-n]` commits, `pull --rebase`, typecheck + build before push, update your status file, no secrets). Add a test for every fix.

1. Tap targets: text links "Go to library" and "Add your first note" are 19 px tall. Give shared link-style buttons a 44 px min hit area (Library/Notes empty states call them; coordinate with AI-3/AI-7 if they need to change call sites).
2. Plan day buttons at 320 px are 37 px tall: raise to 44 px.
3. Phase 4: tablet two-pane layout (list + detail) for Library and Answer at >= 768 px, as a reusable `TwoPane` primitive.
