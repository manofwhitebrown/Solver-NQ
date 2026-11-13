# Phase 5: make it look like a professional product (13 Nov 2026)

The user's brief: the app works but looks plain, grey, badly spaced and boring. Make it look like a team of professionals built it: a new palette, better layout, more appeal. **Permission granted by the user to change anything, including the design freeze.** The one hard rule: everything must still work (typecheck, lint, all tests, build, `npm run shots` with 0 layout and 0 axe findings).

## How we avoid colliding (last round several AIs fixed the same bug at once)
1. **AI-5 owns the foundation and pushes it FIRST**: `src/components/ui/tokens.css`, `tailwind.config.ts`, the UI primitives (`Button`, `Card`, `Chip`, `Input`, `Tabs`, `PageHeader`, `EmptyState`, `Dialog`, `BottomSheet`), the app shell (`src/app/Layout.tsx`: tab bar, side nav, `Logo`) and the Answer screen. The marker is `DESIGN V3 READY` in `docs/status/AI-5.md`. Until it appears, work only on content/structure of your own screens, not on colours.
2. After the marker: **use tokens and primitives only** (no hard-coded hex colours, no new one-off shadows). If a primitive is missing something, ask AI-5 in your status file instead of forking it.
3. Own paths only. One screen = one owner. Small commits `[AI-n] ...`, `git pull --rebase` before each push.

## Look and feel (the target)
- **Colour:** deep violet brand (`--accent` 91 61 245) on a soft lilac-white page, white cards, a violet-to-cyan gradient reserved for hero areas and the primary call to action, calm green/amber/red for status. Dark mode: ink-navy page, lifted violet-tinted cards.
- **Shape:** rounder (cards 22 px, controls 14-16 px, chips and primary buttons fully round), soft tinted shadows, no hairline-only boxes.
- **Type:** one display face for titles (heavier, tighter), the existing body face for text; clear scale: page title 28-32, section 20, body 16.
- **Space:** 8 pt grid. Page padding 20 phone / 32 laptop, 24 between sections, 12-16 inside groups. No screen has big empty areas: use illustration/empty-state, or centre content.
- **Motion:** 150-250 ms ease-out, press scale, no decoration that costs readability. Respect reduced motion.

## Lanes (after `DESIGN V3 READY`)
| AI | Screens |
|---|---|
| AI-5 | Foundation (above), Answer view, bottom/side navigation |
| AI-1 | Onboarding, Settings, AI settings panel, Backup, Design gallery (update it to V3) |
| AI-2 | Home/Ask (the hero screen: greeting, big input card, subject chips, recent list, thinking state) |
| AI-3 | Library (rows, filters, selection bar, empty state), data-driven empty/loading skeletons |
| AI-4 | Scan (crop editor chrome, result cards, step indicator), Graph |
| AI-6 | Export, Plan |
| AI-7 | Learn (home, flashcards, review, quiz, stats), Notes |
| AI-8 | App icon + splash + PWA/Android theme colours (`theme-color`, manifest, `colors.xml`), favicon, README/screenshots, final `npm run shots` verification and a written before/after |

## Acceptance for every lane
- Light and dark both look intentional (check the screenshots in `docs/screenshots/`).
- 320, 360, 390, 430 px and 1280 px: no overflow, nothing under the tab bar, tap targets >= 44 px.
- No behaviour change: all existing tests pass; add tests only for new logic.
