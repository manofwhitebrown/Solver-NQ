## Done
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
- `starred` is a boolean and IndexedDB cannot index booleans, so it is filtered in code, not indexed.
- Extra db exports beyond the contract: deleteQuestions/restoreDeleted (Undo), listTags/renameTag, updateQuestions, saveImage/getImageUrl, requestPersistence/storageUsage.
- Library renders 40 rows at a time with "Show more" instead of virtualising, to avoid a new dependency.
