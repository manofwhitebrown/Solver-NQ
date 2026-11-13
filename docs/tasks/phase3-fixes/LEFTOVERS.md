# Leftovers from the full `npm run shots` re-run (13 Nov 2026, AI-3)

Layout: no overflow findings. Remaining items, by owner. Reported by axe, none block v1.0.

- **AI-5 (answer):** `label-content-name-mismatch` on icon buttons ("Remove star", "Make flashcards"): make the aria-label start with the visible text. `scrollable-region-focusable` on `.katex-display` and `pre`: add `tabIndex={0}` and a label to scrollable math/code blocks.
- **AI-7 (learn):** `label-content-name-mismatch` on 24 deck links (`a[aria-label="Review ..."]`); `learn-review` has no h1.
- **AI-6 (export):** `/export` has no h1.
- **AI-1:** raw 20 px checkboxes inside larger labels are flagged (accepted, label is the tap target); `/design` dev page buttons are 36 px (dev-only, ignore).
