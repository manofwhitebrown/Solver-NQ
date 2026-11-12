# Layout audit - phone fit and polish (manager review, 12 Nov 2026)

## A. Acceptance rules (every screen, every AI)

Checked at **320, 360, 375, 390, 412, 430 px** wide (phones) and **640x360 landscape**, light and dark, plus 1280 px laptop:

1. **No sideways page scroll.** Wide things (equations, code, tables, chip rows) scroll inside their own container, with a visible edge fade so users know.
2. **Content width >= viewport - 40 px** on phones (one 20 px gutter per side, from the `Page` primitive only). Today it is 240 px of 320 on Learn/Quiz/Stats/Cards (25% wasted).
3. **One page-title style** from `PageHeader` (same size, weight and top position on every screen).
4. **Tap targets >= 44 x 44 px** (inline text links inside a sentence excepted); **text >= 12 px** everywhere (including the tab bar and chart axes).
5. **Nothing hidden under the tab bar** at the end of scrolling, and nothing hidden by the on-screen keyboard.
6. **Never show raw LaTeX** (`$x = 2$`, `\text{C}_3`) in lists, previews, cards or titles: use `mathToPlain()` (AI-5) or the Markdown renderer.
7. **Icons that look alike must not mean different things; icon-only buttons need an accessible label, and the main actions need visible text labels.**
8. Landscape phone (640x360) is usable: top padding and bars shrink, the first screen shows real content.
9. Dark mode: cards, inputs and buttons are clearly separated from the background; disabled and enabled buttons look clearly different.

## B. What I found (measured on the built app, `main` at `5cef3ee`)

I built the app, seeded 7 realistic questions (including a very wide equation, a long code line, a 100-character unbroken word), and captured **16 screens x 6 screen sizes x 2 themes** in headless Chromium. Automatic checks found **no sideways page scroll and no console errors** (good), but the screens do not fit well:

| # | Finding | Evidence | Owner |
|---|---|---|---|
| 1 | **Double page padding.** `Layout.tsx` already pads the page (`px-5`) and most pages add their own `px-4`/`px-5` again (and nest a second `<main>` inside `<main>`). Left margin on a 320 px phone: Ask/Settings **20**, Library/Answer/Scan/Graph/Backup **36**, Learn/Quiz/Stats/Cards **40**. Content width: 280 / 248 / **240 px**. Screens visibly jump when you switch tabs. | img 02, 05 | AI-1 (+ everyone) |
| 2 | **Page titles are inconsistent:** 24/700 on Ask and Settings, 24/600 on Library, Learn, Quiz, Stats, Cards, Export, **20/600** on Scan and Graph, **18/600** on Backup; the title sits 24 px from the top on some screens and 40-46 px on others. | measured | AI-1 (+ everyone) |
| 3 | **Raw LaTeX leaks into lists:** Library rows and the Cards manager show `$x = 2$ or $x = 3$`, `$s = 96\ \text{m}$`, `$\text{C}_3\text{H}_8 ...$`. Looks broken and unprofessional. | img 01, 03, 08 | AI-5 (helper), AI-3, AI-7 |
| 4 | **Answer toolbar:** 7 icon-only buttons crammed in a row, each **32 x 44 px** (too narrow), with two identical "upload arrow" icons (Export and Share) and two similar "copy" icons (Flashcards and Copy). Nobody can tell what they do. | img 01, 04 | AI-5 |
| 5 | **Chip rows cut off with no hint:** Ask subject chips (Biology clipped), Library has two clipped filter rows (Chemistry, #kinematics). Chips are 36 px high. | img 01, 05 | AI-2, AI-3 |
| 6 | **Tab bar:** labels are **11 px**; the translucent bar shows blotchy blurred content behind it; it takes **57 px** and stays visible while typing or doing a review/quiz. In **landscape (640x360)** it eats 16% of the height and the first screen shows almost nothing. No landscape handling exists in the code. | img 06 | AI-1 |
| 7 | **Review screen** (flashcards) has no title, no close/back button, no progress bar, a huge empty card, and a keyboard hint "Show answer (Space)" that makes no sense on a phone. | img 02 | AI-7 |
| 8 | **Stats:** empty chart is a blank box with **9 px** axis labels; text links "View stats" / "Manage cards" are 19-23 px tall; Quiz "Timed exam mode" checkbox is 20 x 20 px. | img 02 | AI-7 |
| 9 | **Dark mode is flat:** cards barely separate from the background; the disabled **Send** button looks the same as an enabled one. | img 07 | AI-1 |
| 10 | **Ask:** the text box shows a desktop resize grip on touch screens; hint "Ctrl+Enter" is irrelevant on phones. | img 01 | AI-1 (component), AI-2 |
| 11 | **Scan:** sparse page, small 20 px title, "or drop it here" on a phone. | img 03 | AI-4 |
| 12 | **Backup:** awkward numbers ("Using 6.0 MB of 10246.0 MB available"), 18 px title. | img 04 | AI-3 |
| 13 | **Answer page:** the question card is oversized (reading-size text) and pushes the answer down; on laptop the empty Follow-up panel takes half of the screen. | img 01, 08 | AI-5 |
| 14 | **Laptop:** content column is narrow (about 700 px) with large empty areas; Library chip rows clipped. | img 08 | AI-1 |
| 15 | **Graph:** axis labels 11 px; "Zeros and intersections" checkbox 20 px. | img 04 | AI-5 |

Not testable in my headless browser (needs a real phone, see Manual tests): notch/safe-area on real devices, Android keyboard behaviour, real touch feel.

Screenshots: `docs/audit/img/` (8 contact sheets). Reusable tool: `docs/audit/tools/layout-audit.mjs` (works in sandboxes without a browser).

## C. Assignments

### AI-1 Design system
- **[P0, before `DESIGN V2 READY`] One source of page padding.** `Page` owns the gutters (20 px phone / 28 tablet / 40 laptop). Remove the `px-5` + `pt-6` from the `Layout.tsx` main wrapper, make the layout provide the single `<main>`, and tell everyone in `docs/DESIGN.md` that pages must use `<Page>` (no `<main>` and no own horizontal padding). Finding 1.
- **[P0] One title style:** `PageHeader` is the only way to render a page title (same size, weight, top position, optional subtitle/actions/back). Finding 2.
- **[P0] Tokens:** disabled buttons must look clearly different from enabled ones in light and dark (use a neutral fill and muted text, not a washed-out accent); card/background separation in dark mode (finding 9).
- **[P1] Tab bar v2:** labels >= 12 px; opaque `surface` with a hairline top border (no translucent blur blotches); hide it when the virtual keyboard is open (`visualViewport` height shrink) and on focused flows (`/learn/review`, `/learn/quiz`, `/scan` crop step) through a route flag; in short viewports (< 500 px tall, i.e. phone landscape) switch to a **left rail** or a 48 px compact bar and reduce top padding. Finding 6.
- **[P1] Laptop widths:** lists and dashboards `max-w-5xl`; reading pages stay 44 rem; the answer page shows the follow-up panel only when opened (give the space to the answer). Finding 14.
- **[P1] Textarea:** `resize-none` on touch devices (`@media (pointer: coarse)`). Finding 10.
- **Verify:** run the layout audit tool at 320/360/412 px and fix anything from the acceptance rules that is yours (rules 1-5, 8, 9).

### AI-2 AI engine / Ask
- **[layout pass, P1 item 7] Ask screen:** subject chips row gets an **edge fade + scroll-snap**, chips >= 44 px tall (findings 5); hide the "Ctrl/Cmd+Enter" hint on touch devices (finding 10); the Send button's disabled state must be obviously disabled; first-run "no key" card instead of the empty prompt. Use `Page`/`PageHeader` (no own padding). Verify at 320 px.

### AI-3 QA tooling / Library / Backup
- **[P0-3 demo data]** Put these cases in `seedDemoData()` so every AI can see them: a very wide display equation (binomial expansion), a code block with a 100-character line, a 100-character unbroken word in a question, a 5-line question, and a starred item. My seed used the ids `q1..q7` / `aq1..aq7`; you may keep or change them. (Reference: `docs/audit/tools/layout-audit.mjs`.)
- **[P0-3 screenshot tool] Adopt the audit tool:** start from `docs/audit/tools/layout-audit.mjs` (uses `@sparticuz/chromium`, so it works without an installed browser) and fold it into `npm run shots`: screenshots plus the layout checks, summary written to `docs/screenshots/layout.md`. Add the sizes **320, 360, 375, 390, 412, 430 and 640x360 landscape** to your list. Finding list in `docs/audit/LAYOUT-AUDIT.md`.
- **[P1 Library v2]** Replace the two clipped chip rows with **one compact filter bar** (search + a "Filters" button opening a sheet with subject, tags, starred; selected filters shown as removable chips that wrap). Rows >= 64 px; filter and select controls >= 44 px. Finding 5.
- **Raw LaTeX:** list snippets (question, final answer) go through `mathToPlain()` from AI-5 (AI-5 pushes it in P0; until then strip `$` and `\text{}` in one small helper of your own and swap later). Finding 3.
- **[P1 Backup]** Format storage as "6 MB of 10 GB used"; use `PageHeader`. Finding 12.

### AI-4 Scan
- **[layout pass, P1 item 5] Scan:** use `PageHeader` (the title is 20 px today, finding 11); on touch devices drop "or drop it here" and make **Take a photo** the single obvious primary action with a short 3-step hint under it; keep >= 44 px targets on the crop screen; verify at 320 px and landscape (the crop view must fit 360 px height with its action bar).

### AI-5 Answer / Graph
- **[P0, others depend on it] Export `mathToPlain(text: string): string`** (new small file `src/features/answer/plainText.ts`, re-exported from `src/features/answer/index.ts`): turns `$x = 2$` into `x = 2`, `\text{m}` into `m`, `\frac{a}{b}` into `a/b`, `x^2` into `x²` where easy, `\sqrt{x}` into `√x`, strips `$$`; never throws; unit-tested with at least 15 cases. AI-3 and AI-7 use it in lists and cards. Finding 3.
- **[P1 item 4, Answer v2] Replace the 7-icon row** (finding 4): phone = bottom action bar above the tab bar with **labelled** actions (Star, Cards, Export, More); "More" sheet = Tags, Read aloud, Share, Copy. Every button >= 44 x 44 px, **distinct icons** (Export = download/file, Share = share-nodes, Cards = stacked cards, Copy = two sheets), `aria-label` on all. Laptop = same actions as a labelled toolbar.
- **Question card:** show the question at 18/1.5 (not reading size) and collapse questions longer than 4 lines with "Show more"; the final answer should be visible without scrolling on a 360x640 phone in Answer mode. Finding 13.
- **Graph:** axis labels >= 12 px, the "Zeros and intersections" control a 44 px row, `PageHeader` title. Finding 15.

### AI-6 Export / Planner
- **[layout pass] Export and Planner:** both screens use `Page`/`PageHeader` and the standard gutters; the paper preview must **scale to the available width** (no horizontal scroll at 320 px), the options sheet and the Save/Share bar sit **above the tab bar** without magic bottom paddings (`pb-40` today). Build `/plan` on the primitives from day one and verify at 320 px. Findings 1-2.

### AI-7 Learn / Notes
- **[layout pass, P1 item 8] Review screen** (finding 7): add a close button and a progress bar ("9 left" -> progress bar + count), remove the empty min-height from the card (it sizes to content, centered, with room for long text), hide keyboard hints ("(Space)", "1-4") on touch devices, grade buttons >= 48 px. Hide the tab bar during review/quiz via AI-1's route flag when it exists.
- **Stats** (finding 8): chart empty state ("Review some cards to see your progress") instead of a blank box; axis labels >= 12 px or fewer ticks; "View stats" / "Manage cards" become 44 px buttons; the Quiz "Timed exam mode" checkbox becomes a 44 px row (`<Checkbox>`).
- **Raw LaTeX:** card lists and previews use `mathToPlain()` from AI-5 (finding 3).
- All `/learn/*` and `/notes/*` pages use `Page`/`PageHeader` only (no own horizontal padding or `<main>`). Findings 1-2.

### AI-8 Infra / docs
- **[P2, optional] Layout audit workflow:** a `workflow_dispatch` GitHub Action that builds the app, runs `docs/audit/tools/layout-audit.mjs` (after AI-3 folds it into `npm run shots`) and uploads screenshots + the summary as a downloadable artifact, so the user can run it from the Actions tab without any AI.
- **[P1, with `docs/DEVICE-TEST.md`] Add real-device layout checks** I could not do: notch/gesture-bar safe areas (bottom tab bar not under the gesture bar), keyboard open on Ask (tab bar and Send button stay reachable), rotate to landscape, 200% font size in Android settings (nothing clipped), smallest phone you have.

## D. Order (so nothing needs a fix-up phase)

1. **AI-1 P0** (single padding source, `PageHeader`, tokens) -> writes `DESIGN V2 READY`.
2. **AI-5 P0** `mathToPlain()` (AI-3 and AI-7 consume it).
3. **AI-3 P0** demo data + audit tool in `npm run shots` (everyone verifies with it).
4. Everyone's **layout pass** (their bracketed items) after `DESIGN V2 READY`; AI-1 P1 (tab bar v2, laptop widths) can run in parallel.
5. The manager re-runs the same audit on `main` and signs off, or sends back only the items that still fail the acceptance rules.
