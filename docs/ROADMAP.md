# Solver-NQ roadmap: from now to the product the user imagined

*Written by the manager, 12 Nov 2026. Counts assume each phase passes its sign-off.*

## Current status (updated 12 Nov 2026)

**Phase 2: finished.** All 8 AI lanes are complete. Typecheck, lint (0 warnings) and 360 tests pass; Android APK and Pages builds were green at last check. Leftovers closed in the final sweeps: lazy-loaded math (entry chunk 174 kB), study-pack contents page numbers, inline-math overflow, Scan header, notes screenshots, proxy env vars documented, `api/ask.ts` typed.

**Phase 3: about 80% done.**

| Part | State |
|---|---|
| 1. Real-device fix loop | **Waiting for the user**: run `docs/DEVICE-TEST.md` on a phone and a laptop, send the findings |
| 2. End-to-end QA | Done: real-browser run with mocked Gemini (ask -> answer, 8 routes), no console or CSP errors |
| 3. Performance | Done: entry chunk 174 kB (was 1.1 MB), mathjs lazy; 2,000-item library measured earlier |
| 4. Accessibility | Mostly done: key tap targets raised to 44 px. Still small: plan day buttons at 320 px (37 px), a few laptop-only links |
| 5. Security review | Done: history scanned, CSP added, Android auto-backup off, saved key state validated; see `docs/SECURITY.md` |
| 6. Release v1.0 | **Waiting for the user**: add the 4 Android signing secrets, then push tag `v1.0.0` |
| 7. Final audit | Not finished: full `npm run shots` re-run (about 10 min) after the tap-target fixes |

**Deliberately skipped (optional, low value):** AI-2 streaming answers and sharing provider logic between `api/ask.ts` and the app.

**Not verified anywhere:** the real Gemini API (no AI had a key), and everything that needs a physical Android phone (camera, ML Kit OCR, reminders after reboot, PDF share sheet).

**Next steps, in order:** (1) install the APK and run DEVICE-TEST, (2) add a free Gemini key and ask one question, (3) send me what breaks, (4) re-run `npm run shots` and fix leftovers, (5) create the keystore, add secrets, tag `v1.0.0`. Then Phase 4 extras only if wanted.

*Credit: built by Mohammed Abdul Nayeem (shown in Settings > About).*

## The product we are building (definition of "v1.0")

1. Scan a question or type it, and get a clear step-by-step answer in seconds.
2. **Free to run:** Google Gemini free tier with an automatic fallback across several models.
3. **Learn mode** (teaches) and **Answer mode** (just solves), for many subjects, with a math "verify" badge.
4. A saved **library** with offline search; **export** to PDF, Markdown and Word; **study packs**.
5. **Flashcards, quizzes, notes and summaries, study planner.**
6. Works **offline** for everything saved; new questions queue until you are online.
7. An **APK** built by GitHub and a **web version** for the laptop, both from the same source in this repo.
8. A **calm, professional look**: the new palette, spacing and layout, fitting every phone.
9. A short **user guide**, so the user can install, add a free key, and use it without any AI.

## Where each requirement stands

| # | Requirement | Status today | Finished in |
|---|---|---|---|
| 1 | Scan/type -> answer | Built (web verified; native OCR unverified) | Phase 2 (verify) + Phase 3 (real device) |
| 2 | Free Gemini + fallback | **Not built** | Phase 2 (AI-2) |
| 3 | Learn/Answer, verify | Built | Phase 2 polish |
| 4 | Library, export | Built (pretty PDF unproven at scale) | Phase 2 |
| 5 | Cards, quizzes, notes, planner | Cards/quizzes built; notes and planner new | Phase 2 |
| 6 | Offline | Built and verified on web | Phase 2 re-check, Phase 3 on phone |
| 7 | APK + web | Web works; **APK build failing** | Phase 2 (AI-8) |
| 8 | Look and layout | **Below the bar** (audit found 15 issues) | Phase 2 (all 8 AIs) |
| 9 | User guide | Missing | Phase 2 (AI-8) |

## Phases

**Phase 2: in progress now (task files in `docs/tasks/phase2/`).** Design v2 and the layout audit fixes, free Gemini fallback, APK build fix, notes, planner, screenshot tooling. Sign-off: the manager re-runs the layout audit and checks the APK artifact and Pages build are green.

**Phase 3: required, then v1.0 is done. Smaller than Phase 2; fewer AIs are enough.**
1. **Real-device fix loop:** the user runs `docs/DEVICE-TEST.md` on a phone and a laptop and pastes the findings; the AIs fix them.
2. **End-to-end QA:** full flows (scan -> answer -> save -> export -> cards -> quiz -> plan) tested in a browser by one AI, bugs routed to owners.
3. **Performance:** cold start, entry bundle, a 2,000-item library, big PDF packs.
4. **Accessibility:** fix what the automated scan reports (labels, focus order, contrast, 200% font size).
5. **Security review:** where keys are stored, dependency audit, content-security policy, no secrets in repo history.
6. **Release v1.0:** signed APK on a GitHub Release, final README, user guide check.
7. **Final manager audit** with the same screenshot and layout tool.

**Phase 4: optional extras (v1.1 and later), only if you want them.**
Cloud sync of the library (GitHub Gist or Drive), an offline AI model you download once, tablet two-pane layouts, a Share-to-app target ("share a photo to Solver-NQ"), voice input, more languages in the interface, Play Store listing.

## So how many phases are left?

- **After Phase 2: one required phase (Phase 3).** When it passes, the product is what we imagined.
- **Plus one optional phase (Phase 4)** for extras beyond the original idea.
- If your real phone reveals something large, we add a short fix round inside Phase 3, not a new phase.
- Several AIs hit usage limits in Phase 1, so a phase may take more than one working session. That adds time, not phases.

## Rules that keep the phases from colliding

- Each phase has a **sign-off** by the manager before the next one starts.
- **Design freeze after Phase 2 sign-off:** tokens, spacing scale and layout primitives change only through the manager (`docs/audit/LAYOUT-AUDIT.md`, section F).
- Phase 3 and 4 files are written **after** the previous sign-off, so they target real findings instead of guesses.
