> Superseded for lanes by `docs/tasks/phase5-design/README.md`. Keep this file only for the shared rules below.

# Design v3: make it look like a professional product team made it

The user lifted the design freeze (13 Nov 2026). Foundations are done by AI-1 (tokens, Button, Chip, Tabs, Card, Layout, SubjectTile). Each AI now applies them to its screens. **Everything must keep working**: typecheck, lint, tests, and `npm run shots` (layout + a11y) must stay clean.

Shared rules
- Use only tokens and primitives: `brand-grad`, `elev-1/2`, `shadow-glow`, `rounded-xl` cards, pill buttons, `SubjectTile`. No new hard-coded colours except decorative tints.
- Spacing: 24 px between sections, 16 px between cards, 20 px card padding (28 px laptop). Titles bold, one primary action per screen.
- Every interactive target 44 px. Contrast tests in `tokens.contrast.test.ts` must pass.
- Empty states get an illustration/icon, one sentence, one button.

| AI | Screens | Brief |
|---|---|---|
| AI-1 | Shell, Ask, Settings, Welcome/onboarding | Hero greeting on Ask, onboarding with brand illustration, grouped settings cards with icons |
| AI-2 | AI settings, Ask states (thinking, queued, error) | Animated "thinking" state, friendlier error cards, model-status chips |
| AI-3 | Library, filters, selection bar, backup | Sticky glass search bar, filter chips, stats strip, swipe actions feel |
| AI-4 | Scan | Camera-style framing guides, step indicator in brand colour, result card polish |
| AI-5 | Answer, Graph | Reading layout (answer hero card, numbered step badges, verify badge), math sizing |
| AI-6 | Export, Plan | Preview cards, progress ring in brand gradient, week strip |
| AI-7 | Learn, flashcards, quiz, notes | Deck cards with SubjectTile, flip animation, streak/progress header |
| AI-8 | Update bar, Offline banner, README screenshots, `npm run shots` full re-run | Refresh all screenshots and docs at the end |
