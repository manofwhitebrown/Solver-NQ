## Phase 2
- P0-1 DONE: Dexie v3 (`notes`, `kv`), `saveNote/getNote/listNotes/deleteNote`, `kvGet/kvSet/kvDelete` (all exported from `@/lib/db`), notes in offline search, backup v2 (notes+kv, v1 files still import, merge-safe), tests.
- AI-1: I added `Note` and `NoteFilter` to `src/types.ts` (tiny edit, as the task allowed).
- P0-2 DONE: `seedDemoData()` in `src/lib/db/demo.ts` (14 questions, both modes, match/mismatch/unchecked, 12 cards (7 due), 3 notes, study plan in kv key `study-plan`, 6 days of review history in the Learn progress localStorage). Includes layout edge cases (wide equation, 100-char code line, 100-char word, 5-line question, starred). Only runs with `VITE_DEMO=1` or dev; verified it is absent from the normal build. Ids in `DEMO_IDS` (`demo-a01` learn, `demo-a04` answer, `demo-a02` wide math, `demo-a10` code, `demo-a09` long word, `demo-a13` 5-line). Demo builds expose it as `window.__solverDemo.seedDemoData()`.
- Cross-owner edit (AI-1): 2 lines in `src/main.tsx` that expose the demo module when `VITE_DEMO=1`.
- P0-3 DONE: `npm run shots` works (see `docs/screenshots/README.md`). `scripts/shots*.mjs`, dev deps `puppeteer-core`, `@sparticuz/chromium`, `axe-core` added to `package.json` (AI-1: tiny cross-owner edit, plus the `shots` script and two `.gitignore` lines). Full run committed: 76 JPEGs (all <= 150 KB, phone 390x844 + laptop 1280x800, light + dark), `a11y.md`, `layout.md` (layout checks also at 320/360/375/412/430 and 640x360 landscape). `npm run shots -- /library /learn` captures only those routes. Skipped (not built yet): `/notes`, `/plan`, `/design`, onboarding; re-run when they exist.
- Heads-up for all: the old `docs/audit/tools/layout-audit.mjs` is now superseded by `npm run shots`.

## Remaining (Phase 2)
- Nothing open in my lane. Only real-device confirmation is left (see Manual tests). Re-run `npm run shots` after other AIs change layouts.

## In progress
- None.

## Phase 2 P1 done
- Library v2: one search + "Filters" button (sheet with subject, starred, tags, Edit tags), selected filters as removable wrapping chips, rows >= 64 px (thumbnail, 2-line title, 2-line answer preview, subject badge, tags, date), `PageHeader`, one sticky `ActionBar` for selection, Undo snackbar above the tab bar, snippets through `mathToPlain()`, empty states with a "Clear search and filters" action, keyboard navigation (Up/Down/Home/End between rows).
- P2 decision: kept a bare checkbox in rows, wrapped in a 44 px label with a descriptive aria-label (`<Checkbox>` needs visible text and the row already has it).
- Backup v2: `PageHeader`, Storage card ("6 MB of 10 GB used" + bar + last backup date), "Back up now", gentle reminder after 14 days (or never) when there is data; last backup stored in kv `last-backup-at`.
- Performance (2000 items, fake-indexeddb in Node): list 30 ms (was 1132 ms before a one-scan fix in `latestAnswers`), warm search 19-26 ms, `exportBackup` ~25 ms (524 KB), first page of 40 rows renders in ~57 ms (server render). The list is paged 40 at a time, so no virtualisation needed. Real-device numbers still to confirm.

## Final polish
- Select button and selection bar controls are now 44 px (checked at 320 px); row checkboxes have a 44 px hit area. `/library` and `/backup` have no layout findings and no a11y violations in the latest run.

## Manual tests for the user
- Backup, clear data, restore, confirm everything came back (questions, notes, cards). Download a backup and open it in a text editor to confirm it is valid JSON.
- Run `npm run shots` on your laptop once to confirm it works outside this environment.

## Phase 1 Done
- Data layer (`src/lib/db`): Dexie schema v1 + v2 migration, every contract function, MiniSearch offline search (kept in sync on save/delete, rebuilt on startup), images with thumbnails, transactional writes. 15 tests pass (migration, CRUD, search, backup round trip, import validation, all-or-nothing import).
- Backup (`src/features/backup`): `BackupPanel` (download, restore, storage usage, `navigator.storage.persist()`), route `/backup`. Import validates, merges without overwriting, skips duplicates, never throws.
- Library (`/library`): search, subject/tag/starred filters, multi-select (long-press or checkbox), Export to `/export?ids=...`, Add tag, Star, Delete with Undo, tag rename/delete sheet, empty state, paged list (40 at a time).
- Phone fixes: selection bar was hidden behind the tab bar (now floats above it); added a Select button so laptop users can use checkboxes without long-press.
- typecheck, lint, build and tests green at last push.
## In progress
- Waiting on the manager's phone-layout audit; I already checked `/library` and `/backup` at 390px and 1280px in a headless browser.
## Needs from others
- AI-1: add a link to `/backup` in the settings screen (or embed `<BackupPanel />` from `@/features/backup`).
- AI-6: `saveFile` is still a stub; backup download uses it.
- AI-2: `queuePending` now takes a full `PendingItem` (with id), as in `src/types.ts`.
## Notes for the manager
- AI-1's checkbox note: already fixed in 912b21a (`accent-[rgb(var(--accent))]`). I kept a bare checkbox in library rows because `<Checkbox>` requires a text label and the whole row is already the 44px+ tap target. Tell me if you want it swapped anyway.
- Verified in a real browser: backup download, wipe, restore, re-import (0 added) and a bad file all behave.
- `starred` is a boolean and IndexedDB cannot index booleans, so it is filtered in code, not indexed.
- Extra db exports beyond the contract: deleteQuestions/restoreDeleted (Undo), listTags/renameTag, updateQuestions, saveImage/getImageUrl, requestPersistence/storageUsage.
- Library renders 40 rows at a time with "Show more" instead of virtualising, to avoid a new dependency.

## Phase 3/4 (AI-3, 13 Nov)
- Phase 4 DONE: optional Gist sync in `/backup` (`src/features/backup/gist.ts`, `GistCard.tsx`, 5 tests). Private gist, upload + download-and-merge (never overwrites), photos not synced. Token and gist id live in localStorage only, never in the DB or backups (tested). `exportBackup({ images: false })` added (backward compatible).
- Phase 3 task files for the other AIs: `docs/tasks/phase3-fixes/`.
- Needs from others: none (CSP `connect-src` is already open). Real GitHub call is unverified (no token in tests); user should try Upload then Download on two devices.
- Phase 5 prep (13 Nov): added `npm run e2e` (scripts/e2e.mjs): real-browser smoke test with mocked Gemini, 15 checks (ask, library, search, cut-off reply, bad key, 6 routes, no console errors). All pass on main. Finding for AI-2: with a single-model chain, the cooldown message says 'the next model in your list will answer' even when there is no other model.

## Design v3: Library (13 Nov)
- Library redesigned on the teal foundation: sticky glass search + Filters button, one-tap subject rail (44 px chips), stats tiles (Saved / Starred / This week), rows grouped under Today / Yesterday / This week / month headings, rounder cards, lucide star, skeleton rows while loading, branded empty state. New: grouping.ts (+3 tests), LibraryStats, SubjectRail, RowSkeleton.
- Verified: typecheck, lint, 388 tests, e2e 15/15, `npm run shots -- /library` 0 layout findings, 0 axe violations (phone, laptop, light, dark, 320-430 px). Library screenshots refreshed.
- Backup screen visuals belong to AI-1's lane in phase5-design; I did not touch them.
