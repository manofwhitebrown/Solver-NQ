# Solver-NQ — PHASE 2 — Task for AI-7: Notes & Summarizer (new feature) + Learn v2

> **Where this file lives:** `docs/tasks/phase2/` in the repo. The user starts you with a short message that includes the GitHub token. Clone first, then work from this file. This file contains **no secrets**.
> Phase 1 task files are still in `docs/tasks/` (their rules still apply unless this file says otherwise).

---

## 0. SETUP (same as Phase 1)

**Clone with git. Never fetch, browse or "web read" the repo URL (that fails).**

```bash
export GITHUB_TOKEN='<the token the user gave you>'     # session variable only
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH" clone https://github.com/manofwhitebrown/Solver-NQ.git
cd Solver-NQ && git config user.name "AI-7" && git config user.email "ai-7@users.noreply.github.com"
# every push:
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-7] what changed"
git -c http.extraheader="$AUTH" push origin HEAD:main
```

Token rules: use it to push often; never write it into any file in the repo, commit message, log or message; never put it in a URL; never `echo` it; check `git diff --cached | grep -E "github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}"` before committing. If it is rejected, stop and tell the user. No shell/git/network = say exactly what is missing; do not fake work.

---

## 1. MANAGER AUDIT — where the project stands (12 Nov 2026, main at `380b6b7`)

**Good:** 86 commits, all 8 areas exist, 162 tests pass, lint has 0 errors (13 warnings), the web version deploys to GitHub Pages (`https://manofwhitebrown.github.io/Solver-NQ/`).

**Problems found (they drive Phase 2):**
1. **The Android APK workflow is FAILING** at `npx cap sync android`. Cause: Capacitor CLI 8.6 requires Node >= 22, the workflow uses Node 20. -> AI-8, P0.
2. **The free-tier fallback system was never built.** It was added to AI-2's task after AI-2 finished. There is no `src/lib/ai/fallback`, no `src/features/ai-settings`, the default provider is still **Anthropic with a paid model**, and the Gemini default model name is outdated. The user needs **free Gemini with a chain of several models**. -> AI-2 P0.
3. **Theme and spacing are the user's top complaint** (they have seen the app). Measured on the current tokens: card vs page background contrast is only **1.08:1 (light) / 1.10:1 (dark)**; borders are **1.33:1 / 1.44:1** against cards, so cards, inputs and buttons barely separate from the page; the `warn` text colour is **3.85:1** on white and `muted` on `raised` is **4.30:1** (both fail AA 4.5:1); dark-mode surface steps are tiny (1.10:1, 1.13:1) so there is no sense of depth; spacing is dominated by `gap-2`/`gap-3`/`p-3` (8-12 px), so screens feel cramped. -> AI-1 P0, then everyone does a layout pass.
4. **Missing:** "Answered by <model>" label (AI-5), first-run onboarding, demo data, screenshots (nobody has *seen* the screens except through headless checks), a first test with a real AI key.
5. **Main JS bundle is 1.1 MB (326 kB gzip).** Heavy libraries are lazy, but the entry chunk is too big. -> AI-8 P1.
6. **Not verified on real hardware:** native ML Kit OCR, Android share/save, text-to-speech, daily notification, the "pretty" PDF at 20+ answers.

---

## 2. PHASE 2 RULES

- **Priorities:** do **P0** first, then **P1**, then **P2**. Push after **every** item.
- **Capacity:** several AIs hit usage limits in Phase 1. Do not re-read the whole repo. Read only: your folders, `docs/ARCHITECTURE.md`, `docs/DESIGN.md` (once AI-1 writes it), and files you must call. If you are running low, stop at a clean point, push, and list exactly what is left under **Remaining** in your status file. This file is self-contained, so **any AI can continue it**.
- **Status file** `docs/status/AI-7.md`, after each push: `Done`, `In progress`, `Remaining`, `Needs from others`, `Notes for the manager`, and a new section **`Manual tests for the user`** (short steps the user can do on a real phone or laptop that you could not do; AI-8 collects them into `docs/DEVICE-TEST.md`).
- **Ownership** (only edit your own paths; ask others through your status file):

| AI | Owns |
|---|---|
| AI-1 | `package.json`, `vite.config.ts` (except the PWA block, which AI-8 owns), `tailwind.config.*`, `index.html`, `src/main.tsx`, `src/app/**`, `src/types.ts`, `src/components/ui/**`, `src/lib/settings.ts`, `src/features/settings/**`, `src/features/onboarding/**`, `src/features/design/**`, `docs/DESIGN.md` |
| AI-2 | `src/lib/ai/**`, `src/features/ask/**`, `src/features/ai-settings/**`, `api/**` |
| AI-3 | `src/lib/db/**`, `src/features/library/**`, `src/features/backup/**`, `scripts/shots*`, `docs/screenshots/**`, demo seed |
| AI-4 | `src/lib/ocr/**`, `src/features/scan/**` |
| AI-5 | `src/features/answer/**`, `src/features/graph/**`, `src/lib/verify/**`, `src/lib/tts.ts` |
| AI-6 | `src/lib/export/**`, `src/features/export/**`, `src/lib/plan/**`, `src/features/plan/**` |
| AI-7 | `src/lib/srs/**`, `src/features/learn/**`, `src/lib/notes/**`, `src/features/notes/**` |
| AI-8 | `.github/**`, `capacitor.config.ts`, `android/**`, `src/sw/**`, PWA block in `vite.config.ts`, `vercel.json`, `README.md`, `scripts/ci-*`, `docs/**` (except `docs/status/`, `docs/DESIGN.md`, `docs/screenshots/`) |

- **Order:** AI-1, AI-2, AI-3 (P0 only) and AI-8 (P0 only) start **now** and do not depend on each other. AI-4, AI-5, AI-6, AI-7 start with their non-visual P0 items; their **layout pass** begins when `DESIGN V2 READY` appears at the top of `docs/status/AI-1.md` (`git pull` to check).
- Cross-owner edits are allowed **only** when this file says so or the owner asked in their status file. Keep them tiny and mention them in your status file.
- Keep code plain and simple, many small files (< ~200 lines). Before every push: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` must pass.

---

## 3. DESIGN V2 RULES EVERYONE FOLLOWS (the "layout pass")

The user wants the app to look **appealing and professional, calm, with room to breathe**. When AI-1 pushes the new tokens and layout primitives, every AI fixes its own screens:

- **Use the layout primitives** from `@/components/ui` (`Page`, `PageHeader`, `Section`, `Stack`, `Cluster`, `Card`, `Toolbar`) and the tokens. Do not hand-roll paddings in screens; spacing comes from one place.
- **Spacing scale (4 px grid):** 4, 8, 12, 16, 20, 24, 32, 40, 48.
- **Rhythm:** page gutters 20 px phone / 28 tablet / 40 laptop; **32 px between page sections**; **16 px between cards**; **card padding 20 px phone / 24 px laptop**; 12 px between elements inside a card; 8 px label-to-field; list rows at least 64 px high with 16 px vertical padding.
- **Type:** body 16/1.6; reading text (answers, notes) 17/1.7; secondary 14/1.5; caption 13; titles 28-30 (page), 22 (section), 18 (card). Fewer font sizes, clear hierarchy, `font-weight` 400 / 600 / 700 only.
- **Touch targets:** primary buttons >= 48 px, everything else >= 44 px, >= 8 px between neighbours.
- **No cramped rows, no walls of text, no tiny grey captions.** If a screen looks busy, remove things or move them behind a sheet/menu.
- **Check it visually:** run `npm run shots` (AI-3 builds it in P0) for your routes in phone (390x844) and laptop (1280x800), light and dark, look at the images, fix what looks wrong, and commit the final images to `docs/screenshots/` (JPEG quality ~70, each <= 150 KB). If you have no browser in your environment, say so in your status file; the manager will review the committed screenshots from AI-3's runs.

---

## 4. YOUR PHASE 2 TASK: Notes & Summarizer (new feature) + Learn v2

The learning layer is complete and well tested. Phase 2: **a new feature that fits it perfectly, Notes & Summarizer**, and the layout pass on your screens.

### P0 — Notes & Summarizer (`src/lib/notes/**`, `src/features/notes/**`, routes `/notes`, `/notes/new`, `/notes/:id`)
Students paste or import their own study material and get a summary, a cheat sheet and cards from it.
1. **Inputs:** paste text; upload `.txt` / `.md`; **PDF** (extract text with pdf.js, lazy-loaded; for scanned pages without text, send them to AI-4's `recognize`); an image (OCR); a pasted YouTube transcript (do **not** fetch from the web). Show how many characters/pages were read and let the user edit the text before processing. Hard cap (e.g. 60,000 characters) with a kind message and an option to process the first part.
2. **Outputs** per note: **Summary** (short / medium / detailed), **Cheat sheet** (compact Markdown with headings and bullet points, math in LaTeX), **Key terms glossary**, **Questions to test myself**. Render with AI-5's shared `Markdown` component (lazy-loaded).
3. **Works offline too:** a **local extractive fallback** (sentence scoring, keyword extraction, simple glossary from "X is ..." sentences) so the feature never shows an error when the AI is unavailable. When online use AI-2's `transformText(kind, text, opts, signal)` (they build it in their P1; announce-in-status when ready). Mark local results as "Quick summary (offline)" with a button "Improve with AI".
4. **Storage:** AI-3's `saveNote/getNote/listNotes/deleteNote` (they push the notes table in P0). Notes appear in the global search. Tags and subject per note.
5. **Connect to learning:** "Make flashcards from this note" (reuse the card preview flow `/learn/cards/new?...`, dedupe), "Quiz me on this note" (reuse `buildLocalQuiz`, and `generateQuiz` when online).
6. **Export a note:** Markdown / TXT through `saveFile`; PDF via the print stylesheet (`window.print()`), no new PDF engine.
7. Tests: extractive summariser, glossary extraction, text-length cap, PDF text extraction with a tiny fixture, note CRUD with fake-indexeddb.

### P1 — Learn v2 (after `DESIGN V2 READY`)
8. **Layout pass** on `/learn`, `/learn/review`, `/learn/quiz`, `/learn/stats`, `/learn/cards`: roomy deck cards, a clear daily-goal ring, a large flip card with comfortable text size (reading 17/1.7), grade buttons >= 48 px with next-interval hints, quiz question cards with clear option states (selected / correct / wrong not by colour alone), results page with weak-topics as simple readable rows.
9. Mount AI-6's `TodayCard` on `/learn` when it exists.
10. Make the reminder survive a phone reboot if the plugin supports it, otherwise document the limit honestly.

### P2
11. Deck colours/emoji, "cram mode" (review all cards due within 3 days), replace remaining `any`.

### Manual tests for the user
- Paste a page of notes, get a summary offline (airplane mode), then online improve with AI; make cards; quiz yourself; import a PDF.

### Done when
- Notes works offline (local summary) and online (AI), links into cards and quizzes, has tests, and all `/learn/*` and `/notes/*` screens look clean at 390 px and 1280 px (screenshots committed).
