# Solver-NQ — Task file for AI-3: Data layer & Library

> **Where this file lives:** `docs/tasks/` in the repo. After cloning, your file is `docs/tasks/AI-3-*.md`. The user starts you with a short message that includes the GitHub token; clone first, then work from this file.

You are **AI-3 of 8 AIs** building **Solver-NQ**, a study app: scan or type a question -> step-by-step answer -> save in a library -> export PDF / Markdown / DOCX -> flashcards and quizzes. It runs as an **Android APK** and as a **web app on a laptop**, and works offline as much as possible. **Claude is the manager** and reviews everyone's work, so keep your changes small, clean and easy to review.

---

## 0. SETUP — READ THIS FIRST

### Get the code by CLONING with git. Never by fetching.

**Do NOT open, browse, fetch, "web read" or scrape the repo URL.** That fails. Use `git` in your shell:

```bash
# The user gives you the GitHub token SEPARATELY (in the chat message that told you to start,
# or as an environment variable). It is NOT in this file and must never be written into the repo.
# Put it in a shell variable for your session only:
export GITHUB_TOKEN='<the token the user gave you>'

AUTH="Authorization: Basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')"
git -c http.extraheader="$AUTH" clone https://github.com/manofwhitebrown/Solver-NQ.git
cd Solver-NQ
git config user.name  "AI-3"
git config user.email "ai-3@users.noreply.github.com"
```

To get other people's work and to push yours (re-create `AUTH` in each new shell):

```bash
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-3] short clear message"
git -c http.extraheader="$AUTH" push origin HEAD:main
```

If you have no shell, no `git`, or no network, **stop and tell the user exactly what is missing.** Do not pretend, do not invent file contents you could not push, and do not try to browse the repo instead.

### Token rules (strict)
- **Use the token to push to GitHub often** - after every meaningful chunk of work, not only at the end.
- The token is **not** in this file. The user gives it to you separately. Never write it into the repo in any form (see below).
- The token lives **only** in the `GITHUB_TOKEN` shell variable. **Never** write it into any file inside the repo (code, docs, config, workflows, `.env`, status files), nor into a commit message, log, comment, issue, PR, or any message to anyone. If you need to refer to it, say "the token".
- Never put the token in the clone URL or the git remote URL (use the `http.extraheader` method above).
- Never `echo` the token or `AUTH`, and never run `set -x` around them.
- Before every commit run `git diff --cached | grep -E "github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}" && echo STOP`. If anything shows up, unstage it and remove it.
- If the token is rejected (bad credentials / 401 / 403), stop and tell the user. Do not look for other ways in.
- Never put **any** API key (Anthropic, OpenAI, Gemini, anything) in the code. Users paste their own key in Settings at runtime.

---

## 1. THE PRODUCT (so all 8 of us build the same thing)

- **Learn mode vs Answer mode:** Learn mode shows the method and makes the user think (steps revealed one at a time, a "try the next step" prompt). Answer mode gives the full solution at once. Learn mode is the default.
- **Offline-first:** everything already saved (library, search, flashcards, quizzes, exports) works with no internet. New AI answers need internet; if offline the question goes into a queue and is answered when the connection returns.
- **BYOK:** the user brings their own AI key (stored on their device only). No daily limits from us.
- **Look and feel:** premium, calm, uncluttered. Mobile-first: it must fit a phone screen nicely and never feel congested (min 44px touch targets, safe-area insets, clear spacing). On a laptop (>=1024px) it becomes a sidebar layout. Claude will audit the phone layout and report fixes.
- **Code style:** plain, simple TypeScript. Many small files (aim for under ~200 lines each). No heavy frameworks or engines. Comments only where the code is not obvious.

## 2. STACK (fixed - do not swap it without asking the manager)

React + TypeScript + Vite, Tailwind CSS, **HashRouter** (react-router; hash routing works on GitHub Pages and inside the Android app), Dexie (IndexedDB), KaTeX, mathjs, vite-plugin-pwa, Capacitor for Android. Add other small libraries only when needed; pin exact versions.

## 3. FILE OWNERSHIP (only edit your own paths)

| AI | Owns |
|---|---|
| AI-1 Foundation | `package.json`, `vite.config.ts`, `tailwind.config.*`, `index.html`, `src/main.tsx`, `src/app/**`, `src/types.ts`, `src/components/ui/**`, `src/lib/settings.ts`, `src/features/settings/**` |
| AI-2 AI engine | `src/lib/ai/**`, `src/features/ask/**`, `src/features/ai-settings/**`, `api/**` |
| AI-3 Data & library | `src/lib/db/**`, `src/features/library/**`, `src/features/backup/**` |
| AI-4 Scan & OCR | `src/lib/ocr/**`, `src/features/scan/**` |
| AI-5 Answer view | `src/features/answer/**`, `src/features/graph/**`, `src/lib/verify/**`, `src/lib/tts.ts` |
| AI-6 Export | `src/lib/export/**`, `src/features/export/**` |
| AI-7 Learning | `src/lib/srs/**`, `src/features/learn/**` |
| AI-8 Infra & offline | `.github/**`, `capacitor.config.ts`, `android/**`, `src/sw/**`, `vercel.json`, `README.md`, `docs/**` (except `docs/status/`) |

- **Everyone** writes their own status file `docs/status/AI-3.md` (nobody else touches it).
- Need a change in someone else's files? Do **not** edit them. Write the request in your status file under "Needs from others" and the manager will route it.
- Need a new dependency? `npm install <pkg>` and commit `package.json` + `package-lock.json` alone in a tiny commit, pull first. If the lockfile conflicts: take the remote one, then run `npm install` again.

## 4. SHARED CONTRACTS (AI-1 creates these as stubs; everyone codes to them)

`src/types.ts`:

```ts
export type Subject = 'math' | 'physics' | 'chemistry' | 'biology' | 'coding'
  | 'languages' | 'history' | 'commerce' | 'other';
export type Mode = 'learn' | 'answer';

export interface Step { id: string; title: string; body: string } // body = markdown, math as $...$ / $$...$$
export interface Question {
  id: string; text: string; subject: Subject; tags: string[];
  imageBlobId?: string; starred: boolean; createdAt: number;
}
export interface Answer {
  id: string; questionId: string; mode: Mode; finalAnswer: string; steps: Step[];
  summary?: string; verified: 'match' | 'mismatch' | 'unchecked';
  model: string; createdAt: number;
}
export interface Flashcard {
  id: string; front: string; back: string; subject: Subject; sourceAnswerId?: string;
  due: number; interval: number; ease: number; reps: number; lapses: number;
}
```

Function signatures (stubs throw `new Error('not implemented')` until the owner fills them in):

```ts
// src/lib/ai  (AI-2)
askQuestion(input: { text: string; subject: Subject; mode: Mode; imageDataUrl?: string }, signal?: AbortSignal)
  : Promise<{ answerId: string } | { queued: true }>
followUp(answerId: string, text: string): Promise<Step>
generateCards(answerId: string): Promise<Array<{ front: string; back: string }>>
generateQuiz(questionIds: string[], count: number): Promise<QuizItem[]>
similarProblem(answerId: string): Promise<{ text: string }>
flushPending(): Promise<void>

// src/lib/db  (AI-3)
saveQuestion(q: Question): Promise<void>        saveAnswer(a: Answer): Promise<void>
getQuestion(id): Promise<Question|undefined>    getAnswer(id): Promise<Answer|undefined>
listLibrary(filter: { subject?: Subject; tag?: string; starred?: boolean }): Promise<Array<{ q: Question; a?: Answer }>>
search(text: string): Promise<Array<{ q: Question; a?: Answer }>>
getCachedAnswer(hash: string)  putCachedAnswer(hash: string, a: Answer)
queuePending(item)  listPending()  removePending(id)
putCard(c: Flashcard)  listCards(filter)  listDueCards(now: number)  deleteCard(id)
exportBackup(): Promise<string>   importBackup(json: string): Promise<{ added: number; skipped: number }>

// src/lib/ocr  (AI-4)
recognize(image: Blob | string): Promise<{ text: string; confidence: number }>

// src/lib/verify  (AI-5)
verify(questionText: string, answer: Answer): Promise<'match' | 'mismatch' | 'unchecked'>

// src/lib/export  (AI-6)
saveFile(blob: Blob, filename: string): Promise<void>   // web download OR Android share/save
exportPdf(ids: string[], opts: ExportOptions): Promise<void>
exportMarkdown(ids: string[], opts): Promise<void>   exportDocx(ids: string[], opts): Promise<void>
exportStudyPack(filter, opts): Promise<void>

// src/lib/srs  (AI-7)
nextReview(card: Flashcard, grade: 0 | 1 | 2 | 3): Flashcard   // Again/Hard/Good/Easy, SM-2 style
makeCardsFromAnswer(answerId: string): Promise<Flashcard[]>
```

Routes: every feature folder exports `routes: RouteObject[]` from its `index.ts`. AI-1's `src/app/routes.ts` already imports all of them, so **nobody edits shared routing files**. Navigation paths: `/` (ask), `/scan`, `/answer/:id`, `/library`, `/learn`, `/learn/review`, `/learn/quiz`, `/export`, `/settings`, `/graph`.

## 5. WORKFLOW

1. **AI-1 goes first.** Other AIs may read this file and plan, but do not push code until `docs/status/AI-1.md` says `SCAFFOLD READY` (run `git pull` to check). Until then you can prepare pure logic in your own folder on your machine.
2. Small commits, often. Message format: `[AI-3] what changed`. Always `pull --rebase` before pushing.
3. Before every push run `npm run typecheck` and `npm run build`. Do not push a red build. If CI is red because of someone else's commit, say so in your status file; do not "fix" their files.
4. After every push, update `docs/status/AI-3.md`:

```
## Done
- ...
## In progress
- ...
## Needs from others
- (AI-x: what and why)
## Notes for the manager
- (risks, decisions you made, anything odd)
```

5. Never commit secrets, large binaries (>1 MB) or `node_modules`.

---

## 6. YOUR TASK: Data layer & Library

You build everything that is stored and the screen where the user finds it again. This must be **fast and safe**, and must work fully offline.

### Build (`src/lib/db/**`)
1. **Dexie database** with versioned migrations: `questions`, `answers`, `images` (Blob + thumbnail), `cache`, `pending` (offline queue), `flashcards`. Implement every db function in the contract. Add indexes for subject, tags, createdAt, starred, flashcard `due`.
2. **Search:** offline full-text search over question text + answer text + tags using a small library (e.g. MiniSearch). Keep the index updated on save/delete; rebuild on startup if missing.
3. **Images:** store original as Blob, make a small thumbnail for lists. Provide `getImageUrl(id)` / `saveImage(blob)`.
4. **Backup / restore** (`src/features/backup/**`, plus `exportBackup` / `importBackup`): versioned JSON (images base64 inside, or a zip if you prefer, but simple first). Import must validate the schema, **merge instead of overwrite**, skip duplicates, and report `{ added, skipped }`. Never crash on a bad file.
5. Call `navigator.storage.persist()` once and show storage usage in the backup screen.
6. Corruption safety: wrap writes in transactions; a failed write must not leave half-saved data.

### Build (`src/features/library/**`) - route `/library`
- List grouped or filtered by **subject**, tag chips, date, starred. Each row: question preview, subject badge, thumbnail if any, final-answer snippet.
- Search bar with instant results.
- Multi-select mode (long-press on phone, checkbox on laptop) with actions: Export (-> `/export?ids=a,b,c`), Add tag, Star, Delete with **Undo**.
- Tag editor (BottomSheet from AI-1's UI kit), rename/delete subject-less tags.
- Empty state that explains how to start, in a friendly way.
- Fast with 1000+ items (virtualise or paginate).

### Done when
- Save/get/list/search work offline; reload keeps everything.
- Backup then wipe then restore round-trips with nothing lost. Unit tests cover migrations and import validation.
