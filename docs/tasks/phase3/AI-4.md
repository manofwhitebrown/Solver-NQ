# Phase 3 fix round: AI-4 (Scan and OCR)

Source: the user's QA report of 13 Nov 2026 (browser run with simulated Gemini). Rules: `docs/CONTRIBUTING-AI.md` (own paths only, `[AI-n]` commits, `pull --rebase`, typecheck + build before push, update your status file, no secrets). Add a test for every fix.

DONE: crop box now starts as the whole image (was 5% inset, chopped edge letters); Ask button renamed "Review in Ask" because it never sends.
DONE: unsupported or undecodable file now shows an inline persistent alert on the capture card (plus the toast). Share-to-app target ("share a photo to Solver-NQ") on Android (Phase 4). Re-test with a real phone (DEVICE-TEST.md).
