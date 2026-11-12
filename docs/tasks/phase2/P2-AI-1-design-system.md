# Solver-NQ — PHASE 2 — Task for AI-1: Design System v2 (theme, spacing, layout, onboarding)

> **Where this file lives:** `docs/tasks/phase2/` in the repo. The user starts you with a short message that includes the GitHub token. Clone first, then work from this file. This file contains **no secrets**.
> Phase 1 task files are still in `docs/tasks/` (their rules still apply unless this file says otherwise).

---

## 0. SETUP (same as Phase 1)

**Clone with git. Never fetch, browse or "web read" the repo URL (that fails).**

```bash
export GITHUB_TOKEN='<the token the user gave you>'     # session variable only
AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH" clone https://github.com/manofwhitebrown/Solver-NQ.git
cd Solver-NQ && git config user.name "AI-1" && git config user.email "ai-1@users.noreply.github.com"
# every push:
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-1] what changed"
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
- **Status file** `docs/status/AI-1.md`, after each push: `Done`, `In progress`, `Remaining`, `Needs from others`, `Notes for the manager`, and a new section **`Manual tests for the user`** (short steps the user can do on a real phone or laptop that you could not do; AI-8 collects them into `docs/DEVICE-TEST.md`).
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

## 4. YOUR PHASE 2 TASK: Design System v2 (theme, spacing, layout, onboarding)

You own the look of the whole app. The user's verdict on the current theme and spacing is "very bad", and the measurements agree (section 1, item 3). **Redo the design system properly**, even if that means replacing most of it. Everyone else is waiting for your tokens and primitives, so push P0 fast.

### Research the user collected (use it)
- **Do not just invert light mode for dark mode.** Design a dark palette on its own.
- **No pure black or pure white surfaces.** Use dark grays with a faint blue tint; use off-white text.
- **Dark mode shows elevation with lighter surfaces** (higher layer = lighter), plus a hairline border. Use **3-4 elevation levels at most**. Check that text on the lightest surface still passes contrast.
- **Desaturate colours in dark mode** (accent roughly 20 points less saturated than in light mode) so they do not vibrate.
- **WCAG:** text >= **4.5:1** (large text >= 3:1); UI component boundaries and icons >= **3:1**. Test cards, buttons and fields, not only text.
- **Few accent colours.** One primary accent, semantic ok/warn/bad used sparingly.

### P0 — Tokens v2 + layout primitives (push within your first session, then write `DESIGN V2 READY` at the top of `docs/status/AI-1.md`)
1. **`src/components/ui/tokens.css` v2.** Start from this palette. **Every pair was checked** (all text >= 4.5:1 on bg, surface and raised, in both themes; `line-strong` >= 3:1 on all surfaces). You may refine it, but the test in item 4 must stay green.

```css
:root {
  --bg: 240 242 246;  --surface: 255 255 255;  --raised: 247 248 251;  --overlay: 255 255 255;
  --line: 221 225 233;  --line-strong: 122 131 150;   /* line = decoration, line-strong = input/control borders */
  --ink: 16 22 38;  --ink-2: 61 70 89;  --muted: 94 103 122;
  --accent: 70 60 200;  --accent-ink: 255 255 255;  --accent-soft: 236 238 255;
  --ok: 18 120 82;  --warn: 138 84 0;  --bad: 176 36 48;
  --shadow: 16 22 38;
}
:root[data-theme='dark'] {
  --bg: 13 15 21;  --surface: 21 24 33;  --raised: 29 33 44;  --overlay: 38 43 57;
  --line: 43 49 64;  --line-strong: 112 121 142;
  --ink: 236 238 244;  --ink-2: 193 198 210;  --muted: 150 158 176;
  --accent: 158 170 250;  --accent-ink: 14 16 40;  --accent-soft: 33 38 72;
  --ok: 96 204 158;  --warn: 232 182 96;  --bad: 246 132 138;
  --shadow: 0 0 0;
}
```
   Add soft backgrounds for badges (`ok-soft`, `warn-soft`, `bad-soft`), keep the `--sat/--sab/--sal/--sar` and `--tabbar-h` variables, and update `tailwind.config.ts` (`ink-2`, `line-strong`, `overlay`, `accent-soft`, ...). Because the luminance gap between page and card is small by nature, **separate layers with a 1 px `line` border plus a soft shadow in light mode, and with lighter surfaces plus the border in dark mode** (`elev-1` to `elev-4` utilities).
2. **Type and spacing scale** in Tailwind: font sizes with line-heights (13, 14, 16, 17, 18, 22, 28/30), spacing scale from section 3. Keep Figtree Variable unless it clearly looks wrong.
3. **Layout primitives** in `src/components/ui`: `Page` (gutters 20/28/40, max width: 44rem for reading pages, 64rem for lists/dashboards), `PageHeader` (title, subtitle, actions slot, back button), `Section` (32 px rhythm, optional heading), `Stack` (`gap` prop from the scale), `Cluster` (wrapping row), `Card` (surface, 1 px line, shadow, padding 20/24, optional `interactive`), `Toolbar`. Then **restyle every existing component** to the new tokens and sizes: Button (48/44/36 px, radius 14), Input/Textarea/Select (48 px, `raised` fill, `line-strong` border, clear focus ring), Chip, Tabs, Checkbox, Dialog, BottomSheet, Toast, Skeleton (shimmer), EmptyState (small friendly inline SVG), Spinner.
4. **`src/components/ui/tokens.contrast.test.ts`** (Vitest): parse `tokens.css` and assert the AA rules above for both themes, so contrast can never regress.
5. **Design gallery** at `/#/design` (`src/features/design/**`, not in the nav): swatches with live contrast ratios, type scale, spacing scale, every component, light/dark toggle. This is also what AI-3's screenshot tool captures.
6. **`docs/DESIGN.md`**: short guide with the primitives and a before/after example of a screen using them.

### P1 — Shell, onboarding, defaults
7. **App shell polish:** phone tab bar (translucent, clear active state with a pill, labels >= 12 px, safe-area), laptop sidebar (264 px, wordmark/logo mark you design in SVG, nav items 44 px, active state), `PageHeader` used everywhere, subtle page transition (opacity + 8 px, 180 ms, honours reduced motion).
8. **Settings screen v2:** grouped cards (Appearance, AI, Data, About). The AI card hosts `<AiSettingsPanel />` from AI-2 (if it is not pushed yet, a placeholder that links to onboarding).
9. **Onboarding** (`src/features/onboarding/**`, shown on first run, re-openable from Settings): 3 calm steps: (1) welcome and what the app does, (2) **"Add your free key"** with a numbered how-to for Google AI Studio (Get API key; create it in a new project) and AI-2's `<AddKeyForm />` (use a stub until AI-2 pushes), (3) choose Learn (teach me) or Answer (just solve). Skippable. Add `onboarded: boolean` to settings.
10. **Settings default:** change the default provider to `gemini` in `src/lib/settings.ts` (AI-2's fallback config owns model names; do not hard-code a new model name here).
11. **Page-level code splitting** so the entry chunk shrinks (every route lazy). Report the new main bundle size in your status file (target <= 600 kB raw).

### P2
12. Consistent icon set (one small tree-shaken library, 20/24 px, 1.75 stroke), 404/error page restyle, focus and keyboard polish, replace remaining `any` in your files.

### Done when
- Tokens, primitives, gallery, contrast test, `docs/DESIGN.md` pushed and `DESIGN V2 READY` written. The gallery looks premium in light and dark at 390 px and 1280 px (check with screenshots, not only code).
- Onboarding works end to end and the default provider is Gemini.

---

## 5. LAYOUT AUDIT — extra items for you (added by the manager after a real-screen review)

These items **belong to the Phase 2 priorities shown in brackets; they are not a new phase.** Evidence, screenshots and the acceptance rules are in `docs/audit/LAYOUT-AUDIT.md` (read sections A and B once). A reusable checking tool is in `docs/audit/tools/layout-audit.mjs`.

- **[P0, before `DESIGN V2 READY`] One source of page padding.** `Page` owns the gutters (20 px phone / 28 tablet / 40 laptop). Remove the `px-5` + `pt-6` from the `Layout.tsx` main wrapper, make the layout provide the single `<main>`, and tell everyone in `docs/DESIGN.md` that pages must use `<Page>` (no `<main>` and no own horizontal padding). Finding 1.
- **[P0] One title style:** `PageHeader` is the only way to render a page title (same size, weight, top position, optional subtitle/actions/back). Finding 2.
- **[P0] Tokens:** disabled buttons must look clearly different from enabled ones in light and dark (use a neutral fill and muted text, not a washed-out accent); card/background separation in dark mode (finding 9).
- **[P1] Tab bar v2:** labels >= 12 px; opaque `surface` with a hairline top border (no translucent blur blotches); hide it when the virtual keyboard is open (`visualViewport` height shrink) and on focused flows (`/learn/review`, `/learn/quiz`, `/scan` crop step) through a route flag; in short viewports (< 500 px tall, i.e. phone landscape) switch to a **left rail** or a 48 px compact bar and reduce top padding. Finding 6.
- **[P1] Laptop widths:** lists and dashboards `max-w-5xl`; reading pages stay 44 rem; the answer page shows the follow-up panel only when opened (give the space to the answer). Finding 14.
- **[P1] Textarea:** `resize-none` on touch devices (`@media (pointer: coarse)`). Finding 10.
- **Verify:** run the layout audit tool at 320/360/412 px and fix anything from the acceptance rules that is yours (rules 1-5, 8, 9).
