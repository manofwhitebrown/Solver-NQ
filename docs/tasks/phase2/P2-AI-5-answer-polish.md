# Solver-NQ — PHASE 2 — Task for AI-5: Answer view v2, model label, verify and graph polish

> **Where this file lives:** `docs/tasks/phase2/` in the repo. The user starts you with a short message that includes the GitHub token. Clone first, then work from this file. This file contains **no secrets**.
> Phase 1 task files are still in `docs/tasks/` (their rules still apply unless this file says otherwise).

---

## 0. SETUP (same as Phase 1)

**Clone with git. Never fetch, browse or "web read" the repo URL (that fails).**

```bash
export GITHUB_TOKEN='<the token the user gave you>'     # session variable only
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH" clone https://github.com/manofwhitebrown/Solver-NQ.git
cd Solver-NQ && git config user.name "AI-5" && git config user.email "ai-5@users.noreply.github.com"
# every push:
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-5] what changed"
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
- **Status file** `docs/status/AI-5.md`, after each push: `Done`, `In progress`, `Remaining`, `Needs from others`, `Notes for the manager`, and a new section **`Manual tests for the user`** (short steps the user can do on a real phone or laptop that you could not do; AI-8 collects them into `docs/DEVICE-TEST.md`).
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

## 4. YOUR PHASE 2 TASK: Answer view v2, model label, verify and graph polish

The answer screen is the heart of the app. It exists and is functionally rich, but **no one has seen it on a real screen**, and the model-fallback label was never built.

### P0 — "Answered by" and Retry (needs one function from AI-2)
1. `Answer.model` already records the model. When AI-2 exports **`getPrimaryModel()`** (they build it in P0), show a calm **"Answered by <model>"** line under the final answer. If it is not the first-choice model, make it slightly more visible (accent-soft chip) and add **"Retry with best model"** which calls `askQuestion` again with the cache skipped. Until `getPrimaryModel` exists, show the model name only.
2. Make sure the states **"queued, will answer when free quota resets"** and "answered by a fallback model" read clearly and never alarm the user.

### P1 — Answer v2 layout (after `DESIGN V2 READY`)
3. **Reading experience:** reading text 17/1.7, steps as separate `Card`s with 20 px between them and a step number badge, final answer card clearly distinct (accent-soft background, larger type), generous spacing around display math, **wide equations scroll horizontally inside their own container, never the page**, tables and code blocks styled to the theme, KaTeX colours correct in dark mode (no dark-on-dark).
4. **Phone toolbar:** a **bottom action bar** (it is the **only** bottom bar on this page: AI-1 hides the tab bar on `/answer/:id` on phones and the header gets a Back button; height 56 px + safe-area) with the 4 most important actions (Save/Star, Flashcards, Export, More), the rest in a "More" sheet; the follow-up chat opens as a full-height sheet with a sticky input. Laptop: side panel as now, with comfortable width.
5. **Learn mode polish:** step reveal animation (opacity + slide), clear progress ("Step 2 of 5"), "Try this" prompt styled as a distinct callout, "Show everything" always reachable, `aria-live` announcements for revealed steps.
6. **Graph (`/graph`) v2:** layout pass, larger touch pan/zoom, legend with colour + dash style (not colour only), function input rows >= 44 px, "Graph this" from an answer pre-fills correctly.

### P1 — Verify honesty review
7. Add **at least 30 more verify test cases**: word problems, units, multiple valid forms of the same answer (`x=2, x=-2` vs `x=±2`), rounding tolerance, trig in degrees vs radians, undefined results. Anything the engine cannot truly check must come back `unchecked`, never `match`. Re-read the badge copy once: "Checked" only on a real match, "Doesn't match - double-check" on mismatch, nothing flattering otherwise.

### P2
8. Text-to-speech: skip LaTeX noise, speak steps with natural pauses, remember speed. 9. Replace remaining `any`; keep KaTeX and highlight.js lazy.

### Manual tests for the user
- On the phone: open a saved answer in Learn mode, reveal steps, read aloud, send a follow-up, make flashcards, export. Check a long equation does not break the layout.

### Done when
- The answer screen looks premium and readable at 390 px and 1280 px, light and dark (screenshots committed). The model label works with the fallback system. Verify tests pass and cover the new cases.

---

## 5. LAYOUT AUDIT — extra items for you (added by the manager after a real-screen review)

These items **belong to the Phase 2 priorities shown in brackets; they are not a new phase.** Evidence, screenshots and the acceptance rules are in `docs/audit/LAYOUT-AUDIT.md` (read sections A and B once). A reusable checking tool is in `docs/audit/tools/layout-audit.mjs`.

- **[P0, others depend on it] Export `mathToPlain(text: string): string`** (new small file `src/features/answer/plainText.ts`, re-exported from `src/features/answer/index.ts`): turns `$x = 2$` into `x = 2`, `\text{m}` into `m`, `\frac{a}{b}` into `a/b`, `x^2` into `x²` where easy, `\sqrt{x}` into `√x`, strips `$$`; never throws; unit-tested with at least 15 cases. AI-3 and AI-7 use it in lists and cards. Finding 3.
- **[P1 item 4, Answer v2] Replace the 7-icon row** (finding 4): phone = bottom action bar (the only bottom bar on this page, see above) with **labelled** actions (Star, Cards, Export, More); "More" sheet = Tags, Read aloud, Share, Copy. Every button >= 44 x 44 px, **distinct icons** (Export = download/file, Share = share-nodes, Cards = stacked cards, Copy = two sheets), `aria-label` on all. Laptop = same actions as a labelled toolbar.
- **Question card:** show the question at 18/1.5 (not reading size) and collapse questions longer than 4 lines with "Show more"; the final answer should be visible without scrolling on a 360x640 phone in Answer mode. Finding 13.
- **Graph:** axis labels >= 12 px, the "Zeros and intersections" control a 44 px row, `PageHeader` title. Finding 15.
