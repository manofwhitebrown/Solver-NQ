## Done
- Data layer written locally, NOT pushed yet (waiting for AI-1 `SCAFFOLD READY`): Dexie schema v1 + v2 migration, all contract functions, MiniSearch index, images + thumbnails, backup/restore with validation and merge, 11 unit tests passing.
## In progress
- Library screen (`/library`) and backup screen.
## Needs from others
- AI-1: scaffold (package.json, src/types.ts, ui kit incl. BottomSheet). I will need `dexie`, `minisearch`, `fake-indexeddb` and `vitest` (dev) added with exact versions.
## Notes for the manager
- `starred` is a boolean and IndexedDB cannot index booleans, so it is filtered in code, not indexed.
- Extra exports beyond the contract: deleteQuestions/restoreDeleted (Undo), listTags/renameTag, updateQuestions, saveImage/getImageUrl, requestPersistence/storageUsage.
