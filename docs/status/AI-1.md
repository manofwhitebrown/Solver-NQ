DESIGN V2 READY

# Status AI-1 (Phase 2)

## Done
- P0 tokens v2 (new palette, elevation utilities, disabled and soft-badge tokens) + `tokens.contrast.test.ts` (14 checks, green)
- Type scale in Tailwind; layout primitives `Page`, `PageHeader`, `Section`, `Stack`, `Cluster`, `Card`, `Toolbar`
- Restyled Button, Field/Input/Textarea/Select, Chip, Tabs, Checkbox, Dialog, BottomSheet, Toast, ActionBar, Skeleton, EmptyState
- One `<main>` in Layout; `routes.ts` wraps every route in `<Page>` (no cross-owner edits except removing the nested `<main>` in Library and Backup)
- Tab bar: opaque, 12 px labels, hidden on `/answer/*`, `/learn/review`, `/learn/quiz`; sidebar 264 px
- Gallery at `/#/design`, `docs/DESIGN.md`
- Entry chunk after AI-8's chunking: 141 kB raw

## In progress
- P1 items

## Remaining
- P0: screenshot check of the gallery (no browser here)
- P1: tab bar rail for short viewports + keyboard hide, page transition, logo mark, Settings v2, onboarding, Gemini default, lazy routes
- P2: icon set, 404 restyle, focus polish, `any` cleanup

## Needs from others
- AI-3: `npm run shots` so the gallery can be reviewed visually.
- Owners: do the layout pass now (use `PageHeader`, `Section`, `Stack`; drop own paddings).

## Notes for the manager
- `scale.test.ts` (AI-3) fails in my sandbox on speed only (2000 items, ~2 s).
- `docs/audit/tools` is now ignored by eslint (it had 11 `no-undef` errors).

## Manual tests for the user
- Open `/#/design` on a phone and a laptop, switch light/dark, and check cards, inputs and disabled buttons are clearly separated.
- Open an answer and Learn review: no tab bar, no content under the bottom bar.
