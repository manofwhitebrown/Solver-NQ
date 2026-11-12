# Design system v2 (owner: AI-1)

Live reference: open `/#/design` (swatches with live contrast, type, spacing, elevation, every component, light/dark).
Tokens: `src/components/ui/tokens.css`. Contrast is enforced by `tokens.contrast.test.ts`.

## Rules for every screen
- Import from `@/components/ui`. **Never** render `<main>` and **never** add your own page padding: `routes.ts` wraps every route in `<Page>` (gutters 20/28/40 px, safe-area aware). Reading pages are 44 rem; lists/dashboards are wide (64 rem): add the route path to `WIDE` in `src/app/routes.ts` (or ask AI-1).
- Title = `<PageHeader title subtitle actions back />`. Nothing else renders a page title.
- Vertical rhythm: `Section` (32 px) > `Stack gap={4}` (16 px between cards) > inside a card `Stack gap={3}` (12 px). Label-to-field 8 px (`Field`). Use `Cluster` for wrapping rows, `Toolbar` for search/filter rows.
- Spacing scale (4 px grid): 4, 8, 12, 16, 20, 24, 32, 40, 48 (Tailwind `1,2,3,4,5,6,8,10,12`).
- Type: `text-caption` 13, `text-sm` 14, `text-base` 16, `text-read` 17 (answers/notes), `text-lg` 18 (card title), `text-xl` 22 (section), `text-2xl`/`text-3xl` 28/30 (page). Weights 400 / 600 / 700 only.
- Colours: `text-ink`, `text-ink-2`, `text-muted`; `bg-bg/surface/raised/overlay`; `border-line` (decoration), `border-line-strong` (controls); one accent (`accent`, `accent-soft`); `ok/warn/bad` + `*-soft` for badges only.
- Layers: `Card` (= `elev-1`). Dialogs/sheets `elev-4`. Utilities `elev-1`..`elev-4`.
- Buttons: primary 48 px (`size="lg"`), others 44, `size="sm"` 36 (tap area still 44). Disabled uses `disabled-bg/ink`, clearly unlike enabled.
- Bottom bars: at most one sticky bar above the tab bar (`ActionBar`). The tab bar is hidden on `/answer/*`, `/learn/review`, `/learn/quiz` (Layout sets `--tabbar-h: 0`, so `Page` and `ActionBar` adapt).
- Dark mode: dark grays with a blue tint, no pure black/white, lighter = higher.

## Before / after
```tsx
// before: own padding, own <main>, hand-rolled title
<main className="mx-auto max-w-3xl px-4 pt-4"><h1 className="text-xl font-bold">Library</h1>
  <div className="rounded-lg border border-line bg-surface p-3">...</div></main>

// after: Page comes from routes.ts
<>
  <PageHeader title="Library" subtitle="12 items" actions={<Button size="sm">Select</Button>} />
  <Section><Stack><Card>...</Card></Stack></Section>
</>
```
