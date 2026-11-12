# Solver-NQ — PHASE 2 — Task for AI-3: Screenshot & QA tooling, demo data, notes/KV storage, Library v2

> **Where this file lives:** `docs/tasks/phase2/` in the repo. The user starts you with a short message that includes the GitHub token. Clone first, then work from this file. This file contains **no secrets**.
> Phase 1 task files are still in `docs/tasks/` (their rules still apply unless this file says otherwise).

---

## 0. SETUP (same as Phase 1)

**Clone with git. Never fetch, browse or "web read" the repo URL (that fails).**

```bash
export GITHUB_TOKEN='<the token the user gave you>'     # session variable only
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH" clone https://github.com/manofwhitebrown/Solver-NQ.git
cd Solver-NQ && git config user.name "AI-3" && git config user.email "ai-3@users.noreply.github.com"
# every push:
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-3] what changed"
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
- **Status file** `docs/status/AI-3.md`, after each push: `Done`, `In progress`, `Remaining`, `Needs from others`, `Notes for the manager`, and a new section **`Manual tests for the user`** (short steps the user can do on a real phone or laptop that you could not do; AI-8 collects them into `docs/DEVICE-TEST.md`).
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

## 4. YOUR PHASE 2 TASK: Screenshot & QA tooling, demo data, notes/KV storage, Library v2

You make the project **visible and testable**. Nobody has looked at the real screens in Phase 1; the manager and the user need screenshots, and the other AIs need demo data and two new storage features. You have a working headless browser, so this falls to you.

### P0-1 — New storage (others are waiting; push this first)
- **Dexie v3 migration** adding a **`notes`** table and a **`kv`** table.
- `notes`: `Note { id, title, source: 'paste'|'file'|'pdf'|'image', text: string, summary?: string, cheatsheet?: string, keyTerms?: string[], subject: Subject, tags: string[], createdAt, updatedAt }` (add the type to `src/types.ts` via a request to AI-1 in your status file, or add it yourself in a tiny commit and tell AI-1). Functions: `saveNote`, `getNote`, `listNotes(filter)`, `deleteNote`. Include notes in the **offline search index** and in **backup/restore** (versioned, still merge-safe).
- `kv`: `kvGet<T>(key)`, `kvSet(key, value)`, `kvDelete(key)` for small settings-like data (AI-6's study planner uses it). Included in backup.
- Tests for the migration (old v2 database upgrades cleanly) and for backup round trips including the new tables.

### P0-2 — Demo data (`seedDemoData()`)
Available only when the build has `VITE_DEMO=1` (or `import.meta.env.DEV`), never in the normal production build. Creates about 14 realistic questions across subjects (math with LaTeX steps, physics with units, chemistry, biology, coding with a code block, history), answers in both Learn and Answer mode, a verified and an unverified one, flashcards (some due), a few quiz results, 3 notes, one study plan entry. Idempotent (running twice does not duplicate). Exports demo ids so the screenshot tool can open `/answer/<id>`.

### P0-3 — Screenshot tool (`npm run shots`)
- A script (`scripts/shots.mjs`) using the headless browser you already used (Playwright or puppeteer-core with the installed Chromium). It builds with `VITE_DEMO=1`, serves `vite preview`, seeds demo data, then captures **every route** at **390x844 (phone)** and **1280x800 (laptop)** in **light and dark**: `/`, `/scan`, `/answer/<learn demo>`, `/answer/<answer demo>`, `/library` (normal + select mode), `/learn`, `/learn/review`, `/learn/quiz`, `/learn/stats`, `/learn/cards`, `/export?ids=...`, `/settings`, `/graph`, `/backup`, `/notes`, `/plan`, `/design`, onboarding. Missing routes (not built yet) are skipped with a note.
- Output `docs/screenshots/<route>__<phone|laptop>__<light|dark>.jpg` (JPEG quality ~70, <= 150 KB each, folder replaced on each run). `npm run shots -- /library /learn` captures only those routes.
- **Accessibility scan:** run axe-core on every captured page and write `docs/screenshots/a11y.md` (violations per route, with severity). Do not fail the command on violations; report them.
- Add a short `docs/screenshots/README.md` explaining how to run it. Tell everyone in your status file as soon as it works. **Then run it once for the whole app and push the images** so the manager can review them.

### P1 — Library and Backup v2 + performance
- Layout pass on `/library` and `/backup` with the Design v2 rules (after `DESIGN V2 READY`): roomy rows with thumbnail, subject badge, 2-line preview, tags; filters in a tidy bar/sheet; select mode and action bar clearly separated from the tab bar; useful empty states.
- **Performance test:** seed 2,000 items in a test and measure list render, search latency and `exportBackup` time. If the list takes > 200 ms to become interactive, virtualise it. Write the numbers in your status file.
- Storage health card in `/backup`: usage, last backup date, **"Back up now"**, and a gentle reminder after 14 days without a backup.

### P2
- Decide and finish the `<Checkbox>` swap in library rows, replace remaining `any`, add keyboard navigation to the library list.

### Manual tests for the user
- Backup, clear data, restore, confirm everything came back. Export a backup file and open it in a text editor to confirm it is valid JSON.

### Done when
- `npm run shots` works from a fresh clone and the images for the whole app are committed. Notes and KV storage are live, tested and in backups. `seedDemoData()` works.

---

## 5. LAYOUT AUDIT — extra items for you (added by the manager after a real-screen review)

These items **belong to the Phase 2 priorities shown in brackets; they are not a new phase.** Evidence, screenshots and the acceptance rules are in `docs/audit/LAYOUT-AUDIT.md` (read sections A and B once). A reusable checking tool is in `docs/audit/tools/layout-audit.mjs`.

- **[P0-3 demo data]** Put these cases in `seedDemoData()` so every AI can see them: a very wide display equation (binomial expansion), a code block with a 100-character line, a 100-character unbroken word in a question, a 5-line question, and a starred item. My seed used the ids `q1..q7` / `aq1..aq7`; you may keep or change them. (Reference: `docs/audit/tools/layout-audit.mjs`.)
- **[P0-3 screenshot tool] Adopt the audit tool:** start from `docs/audit/tools/layout-audit.mjs` (uses `@sparticuz/chromium`, so it works without an installed browser) and fold it into `npm run shots`: screenshots plus the layout checks, summary written to `docs/screenshots/layout.md`. Add the sizes **320, 360, 375, 390, 412, 430 and 640x360 landscape** to your list. Finding list in `docs/audit/LAYOUT-AUDIT.md`. Use `puppeteer-core` + `@sparticuz/chromium` as dev dependencies (no browser install needed) and convert the PNGs to JPEG (quality ~70, <= 150 KB each) before committing, as Phase 2 section 3 says.
- **[P1 Library v2]** Replace the two clipped chip rows with **one compact filter bar** (search + a "Filters" button opening a sheet with subject, tags, starred; selected filters shown as removable chips that wrap). Rows >= 64 px; filter and select controls >= 44 px. Finding 5.
- **Raw LaTeX:** list snippets (question, final answer) go through `mathToPlain()` from AI-5 (AI-5 pushes it in P0; until then strip `$` and `\text{}` in one small helper of your own and swap later). Finding 3.
- **[P1 Backup]** Format storage as "6 MB of 10 GB used"; use `PageHeader`. Finding 12.
