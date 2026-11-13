# Phase 4 (optional extras, v1.1). Start only after v1.0 is tagged.

| Extra | Owner | Notes |
|---|---|---|
| Cloud sync of the library (GitHub Gist or Drive), opt-in, encrypted | AI-3 | Reuse Backup v2 format; conflict rule: newest edit wins per item |
| Share-to-app target ("share a photo to Solver-NQ") | AI-4 | Android intent filter + route into /scan with the image |
| Voice input for questions | AI-2 | Web Speech API on web, native plugin on Android; fills the box, never auto-sends |
| Tablet two-pane layouts (library + answer) | AI-5 | Needs a manager-approved layout primitive (design freeze, LAYOUT-AUDIT section F) |
| More interface languages | AI-6 | Start with extracting strings; Hindi, Telugu, Urdu first |
| Offline AI model, download once | AI-7 | Research spike first; report size/speed on a mid-range phone before building |
| Play Store listing (assets, privacy policy, data-safety form) | AI-8 | Needs signed release from Phase 3 part 6 |
| Streaming answers; share provider code between `api/ask.ts` and app | AI-2 | Previously skipped as low value |
| Design-system maintenance, 200% font-size pass | AI-1 | |
