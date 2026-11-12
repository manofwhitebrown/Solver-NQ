# Solver-NQ — PHASE 2 — Task for AI-6: Export v2 verification + Study Planner (new feature)

> **Where this file lives:** `docs/tasks/phase2/` in the repo. The user starts you with a short message that includes the GitHub token. Clone first, then work from this file. This file contains **no secrets**.
> Phase 1 task files are still in `docs/tasks/` (their rules still apply unless this file says otherwise).

---

## 0. SETUP (same as Phase 1)

**Clone with git. Never fetch, browse or "web read" the repo URL (that fails).**

```bash
export GITHUB_TOKEN='<the token the user gave you>'     # session variable only
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH" clone https://github.com/manofwhitebrown/Solver-NQ.git
cd Solver-NQ && git config user.name "AI-6" && git config user.email "ai-6@users.noreply.github.com"
# every push:
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-6] what changed"
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
- **Status file** `docs/status/AI-6.md`, after each push: `Done`, `In progress`, `Remaining`, `Needs from others`, `Notes for the manager`, and a new section **`Manual tests for the user`** (short steps the user can do on a real phone or laptop that you could not do; AI-8 collects them into `docs/DEVICE-TEST.md`).
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

## 4. YOUR PHASE 2 TASK: Export v2 verification + Study Planner (new feature)

Export was built and AI-8 fixed six bugs by testing in a real browser. Two things remain: **prove the "pretty" PDF at realistic scale**, and add a **new feature** that helps students plan: the Study Planner.

### P0 — Export confidence
1. **Real-browser test of the pretty PDF** (KaTeX rasterised): 1, 5 and 20-answer packs. Record time and file size in your status file. Check: math sharp, no block split across pages, headers/footers and page numbers right, A4 and Letter, dark theme does not leak (always white paper). Fix what you find. If you have no browser, run `npm run shots`-style checks via AI-3's tooling or say so plainly.
2. **Memory safety** for big packs (render in batches, free canvases, cancel button works, a failure in one answer does not kill the whole pack).
3. **Android save/share**: re-read `saveFile` against the Capacitor Filesystem/Share docs (cache directory, file URI, MIME types), add mocked-plugin tests, and write **Manual tests for the user** (export PDF/DOCX, share to another app, open the file).

### P1 — Study Planner (`src/lib/plan/**`, `src/features/plan/**`, route `/plan`)
A student enters exams and gets a realistic daily plan.
4. **Inputs:** exams (subject, name, date), available minutes per day (and optional off-days), which subjects feel weak. Stored with AI-3's `kvSet/kvGet` (they push it in P0; until then use a small local wrapper behind one interface).
5. **Planner (local, offline, pure functions, unit-tested):** from today to each exam, spread work across days; more time for weak subjects (weak = low quiz accuracy or many lapses, read from AI-7's stats/db) and for exams that are sooner; each day has 2-4 **tasks** (review due cards, take a quiz in subject X, revisit saved questions tagged Y, read a note, rest day before an exam). Re-plans automatically when the user skips days.
6. **Screen:** countdown cards per exam, "Today" list with checkable tasks that **deep-link** to `/learn/review`, `/learn/quiz`, `/library?subject=...`, `/notes/<id>`; a week view; progress ring. Gentle language, no guilt.
7. Export `TodayCard` (small component) so AI-7 can mount it on `/learn`. Optional daily reminder through the existing `ReminderService` (no-op on web).
8. **Planner layout** with the Design v2 rules; empty state that explains it in one friendly sentence.

### P2
9. Export v2 layout pass on `/export` (preview as a real paper-like card, options in a sheet, result card). 10. Obsidian-friendly Markdown (YAML front matter with subject, tags, date). 11. Replace remaining `any`.

### Done when
- Pretty PDF numbers are recorded and acceptable (20-answer pack in a reasonable time without crashing). `/plan` works offline with tests for the planner logic and looks good at 390 px and 1280 px.
