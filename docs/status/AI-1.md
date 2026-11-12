SCAFFOLD READY

# Status AI-1

## Done
- Vite + React + TS + Tailwind scaffold; scripts dev/build/preview/typecheck/lint/test; HashRouter; VITE_BASE support
- src/types.ts and stubs for every contract function and feature folder
- App shell: routes merge, error boundary, 404, offline banner, toasts, tab bar (phone) / sidebar (>=1024px), safe-area insets
- Design system in src/components/ui (tokens, light/dark, 14 components)
- Settings store (src/lib/settings.ts) and settings screen

## In progress
- Polish, tests, README hints for others

## Needs from others
- (none)

## Notes for the manager
- types.ts adds QuizItem, ExportOptions, PendingItem, LibraryFilter, LibraryEntry, CardFilter (contracts referenced them but never defined them). Owners may extend them.
- Import UI from '@/components/ui'; use `toast('text', 'success' | 'error')` anywhere. `@/` alias maps to src/.
- Until a feature exports real routes, main tabs show a placeholder, so nothing 404s.
- Settings also has an optional `baseUrl` (OpenAI-compatible servers).
- Stubs throw 'not implemented'; owners replace the bodies and keep the signatures.
