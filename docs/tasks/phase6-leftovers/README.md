# What is left (manager update, 13 Nov 2026, main at 9dfec88)

Same rules as `docs/CONTRIBUTING-AI.md`: own paths only, `[AI-n]` commit prefix, `git pull --rebase` first, `npm run typecheck && npm run lint && npm test && npm run e2e` before every push, update your `docs/status/AI-n.md`, **never commit a token**. Good work on the fix round: the manager re-tested everything below on a fresh build with a fake Gemini gateway and real OCR.

## Verified FIXED (do not redo)
Crop starts as the whole image and a tight photo is read completely (B1). "Ask" goes straight to an answer (B2). Offline bar disappears by itself (B3). Cut-off or empty typed answers are not saved (B4). Server/network failures no longer say "limits used up" (B5). Bad key shows one clear message (B6). 388 unit tests, 15/15 `npm run e2e`, typecheck and lint clean, Web and APK workflows green on `9dfec88`.

## NEW problems found today (fix these first)

| ID | Sev | Owner | Problem | How to see it |
|---|---|---|---|---|
| R1 | **P1** | AI-4 | **`/scan` scrolls sideways on small phones** (Design v3 step indicator). Page is 363 px wide at 320 px and 3 px too wide at 360 px (a very common phone width). The "3 Check text" step and the tab bar stick out. | Chromium at 320x640 and 360x740, open `#/scan`. `npm run e2e` checks only one width: **AI-3, add 320 and 360 to the route-overflow check**. |
| R2 | P1 | AI-2 | **"Read with AI" accepts a refusal as the question.** If the model says "I'm sorry, I can't help with that." it is put into the text box. Reject a reply that starts with an apology/refusal and has no digits or maths ("I'm sorry", "I can't", "I cannot", "As an AI"); show "The AI would not read this picture. Type the question instead." and keep the OCR text. Keep a test that real questions starting with those words still pass. | `src/lib/ai/transform.ts transcribeImage` |
| R3 | P2 | AI-2 | **Cut-off and empty replies show the generic "AI service had a problem."** Say what happened: "The reply was cut off. Try again, or ask a shorter question." / "The AI sent nothing back. Try again." Also: one bad reply parks the first model as "cooling down until HH:MM"; a single cut-off should not park a model. | typed question with a `MAX_TOKENS` reply |
| R4 | P2 | AI-2 | **Too many calls on failure:** when every model returns 500 or the network fails the app makes 12 calls (two per model). Cap at 4 per question; stop retrying after the first full pass. | `POST calls=12` in a 500-everywhere run |
| R5 | P2 | AI-1 + AI-2 | **`gemini-2.0-flash` is still the default model** (`src/lib/settings.ts`) and goes first for a migrated key, but AI-2's own note says it was shut down in June 2026, so every question wastes a 404. Remove it as the default; migrated users keep their own choice only if it appears in ListModels. Guessed names in `SUGGESTED_MODELS` must be marked unverified and never go before a verified model. | `src/lib/ai/fallback/store.ts migrate()`, `rank.ts` |
| R6 | P2 | AI-1 | **Model-chain buttons in Settings (Up, Down, Test, Remove) are 36 px tall**, under the 44 px rule (new "compact model chain"). | Settings at any width |
| R7 | P1 | AI-2 | **Nobody has run the code against the real Gemini API.** Write `scripts/gemini-smoke.mjs` (Node 22, `GEMINI_API_KEY=... node scripts/gemini-smoke.mjs`): ListModels, then one tiny text call and one tiny image call per chain slot; print model, status, `finishReason`, latency, characters, and how `classify()` treats errors. Never print the key. The user runs it once and pastes the output; then adjust budgets/parsing. | no such script exists yet |

## Design v3: lanes still open
Done: onboarding, Settings, gallery (AI-1), Library, Backup (AI-3), Scan, Graph (AI-4), Learn, Notes, Stats (AI-7). **Still to do:** Answer view and navigation polish (AI-5), Export and Plan (AI-6), Home/Ask incl. thinking/queued/error states (AI-7 claimed it; AI-2 supports the states), app icon, splash, theme colours, favicon (AI-8). Then **AI-3 runs the full `npm run shots`** (layout + a11y, light and dark, 320/360/390/430/1280) and writes a before/after in `docs/audit/`. Rule: 320, 360 and 390 px must have no sideways scroll on any route (see R1).

## Phase 4 extras: state and owners (start after the items above are merged)
| Extra | State | Owner |
|---|---|---|
| Share-to-app target | done (`1550c31`); needs a real-phone test | AI-4 |
| Cloud sync (private Gist, token kept out of backups) | done (`e6dc3e8`); needs a manual test | AI-3 |
| `npm run e2e` smoke | done (15 checks) | AI-3 (grow it: 320/360 widths, truncated reply, scan tight crop, Ask now) |
| Voice input on Ask | not started | AI-2 |
| Tablet two-pane layouts | not started | AI-5 (needs AI-1's approval of one layout primitive) |
| More interface languages (Hindi, Telugu, Urdu first) | scaffold only (answer strings) | AI-6 |
| Offline AI model: research spike first | not started | AI-7 |
| Streaming answers | not started | AI-2 |
| Play Store assets, privacy policy, data-safety answers | not started; needs the signed release | AI-8 |

## Release v1.0.0 (blocked on the user)
No release exists yet. **AI-8:** there is no keystore helper, so the user cannot make signing keys easily. Add `.github/workflows/create-keystore.yml` (manual; random passwords masked in logs; uploads one private artifact `solver-nq-keystore` with a 1-day retention containing the base64 keystore and the passwords) and rewrite `docs/RELEASE.md` for a non-developer: run it, copy four values into the repo secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`), delete the artifact, **back the keystore up in two places** (a lost key means no updates ever), then push tag `v1.0.0`. The manager writes `RELEASE GO` in `docs/status/MANAGER.md` when the user has done it.

## Still needs the user's phone (nobody else can do this)
Camera capture, ML Kit OCR, handwriting, reminders after reboot, PDF save/share sheet, share-to-app, install over the previous APK. Steps are in `docs/DEVICE-TEST.md`; AI-8 keeps it current and short.
