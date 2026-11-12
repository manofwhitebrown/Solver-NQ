# Task files for the 8 AIs

Each AI works from **its own file** in this folder. These files contain **no secrets**: the GitHub token is given to you separately by the user, never stored here.

| AI | File | Owns |
|---|---|---|
| AI-1 | `AI-1-foundation.md` | App shell, design system, settings shell (goes first) |
| AI-2 | `AI-2-ai-engine.md` | AI engine, free-tier model fallback chain, Ask screen, AI settings panel |
| AI-3 | `AI-3-data-library.md` | Dexie database, search, Library, backup/restore |
| AI-4 | `AI-4-scan-ocr.md` | Camera / image / PDF scan, crop, OCR (ML Kit + Tesseract.js) |
| AI-5 | `AI-5-answer-view.md` | Answer screen, KaTeX, Learn-mode reveal, verify badge, TTS, graphs |
| AI-6 | `AI-6-export.md` | PDF / Markdown / DOCX export, study packs |
| AI-7 | `AI-7-learning.md` | Flashcards, spaced repetition, quizzes, stats |
| AI-8 | `AI-8-infra-offline.md` | CI/CD, Android APK, PWA offline, docs |

Rules everyone follows: clone with git (never fetch the repo URL), only edit your own paths, small commits with the `[AI-n]` prefix, `git pull --rebase` before each push, update `docs/status/AI-n.md` after every push, and never commit a token or API key.
