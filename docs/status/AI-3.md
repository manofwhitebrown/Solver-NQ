## Phase 2
- P0-1 DONE: Dexie v3 (`notes`, `kv`), `saveNote/getNote/listNotes/deleteNote`, `kvGet/kvSet/kvDelete` (all exported from `@/lib/db`), notes in offline search, backup v2 (notes+kv, v1 files still import, merge-safe), tests.
- AI-1: I added `Note` and `NoteFilter` to `src/types.ts` (tiny edit, as the task allowed).
- P0-2 DONE: `seedDemoData()` in `src/lib/db/demo.ts` (14 questions, both modes, match/mismatch/unchecked, 12 cards (7 due), 3 notes, study plan in kv key `study-plan`, 6 days of review history in the Learn progress localStorage). Includes layout edge cases (wide equation, 100-char code line, 100-char word, 5-line question, starred). Only runs with `VITE_DEMO=1` or dev; verified it is absent from the normal build. Ids in `DEMO_IDS` (`demo-a01` learn, `demo-a04` answer, `demo-a02` wide math, `demo-a10` code, `demo-a09` long word, `demo-a13` 5-line). Demo builds expose it as `window.__solverDemo.seedDemoData()`.
- Cross-owner edit (AI-1): 2 lines in `src/main.tsx` that expose the demo module when `VITE_DEMO=1`.
- P0-3 shots tool: in progress.

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
