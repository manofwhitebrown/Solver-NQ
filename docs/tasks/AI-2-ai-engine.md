# Solver-NQ — Task file for AI-2: AI engine & Ask screen

> **Where this file lives:** `docs/tasks/` in the repo. After cloning, your file is `docs/tasks/AI-2-*.md`. The user starts you with a short message that includes the GitHub token; clone first, then work from this file.

You are **AI-2 of 8 AIs** building **Solver-NQ**, a study app: scan or type a question -> step-by-step answer -> save in a library -> export PDF / Markdown / DOCX -> flashcards and quizzes. It runs as an **Android APK** and as a **web app on a laptop**, and works offline as much as possible. **Claude is the manager** and reviews everyone's work, so keep your changes small, clean and easy to review.

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
git config user.name  "AI-2"
git config user.email "ai-2@users.noreply.github.com"
```

To get other people's work and to push yours (re-create `AUTH` in each new shell):

```bash
git -c http.extraheader="$AUTH" pull --rebase origin main
git add -A && git commit -m "[AI-2] short clear message"
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

- **Everyone** writes their own status file `docs/status/AI-2.md` (nobody else touches it).
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
2. Small commits, often. Message format: `[AI-2] what changed`. Always `pull --rebase` before pushing.
3. Before every push run `npm run typecheck` and `npm run build`. Do not push a red build. If CI is red because of someone else's commit, say so in your status file; do not "fix" their files.
4. After every push, update `docs/status/AI-2.md`:

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

## 6. YOUR TASK: AI engine & Ask screen

You build the brain: talking to AI providers from the browser/APK, producing clean structured answers, and the screen where the user asks.

### Build (`src/lib/ai/**`)
1. **The user wants this to cost nothing: Google Gemini (free tier) is the DEFAULT provider.** **Provider interface** + three implementations: **Anthropic** (`/v1/messages`; browser calls need the `anthropic-dangerous-direct-browser-access: true` header plus `anthropic-version`), **OpenAI-compatible** (configurable base URL, so it also covers OpenRouter, Groq, local Ollama), **Gemini**. Model name comes from Settings (free text). Do not hard-code model names that may be retired; use a settings default the user can edit.
2. **Proxy mode:** if `settings.proxyUrl` is set, send the request there with no key attached. Provide a tiny optional Vercel function in `api/ask.ts` that forwards to a provider using a server-side env var (`AI_API_KEY`), with a simple per-IP rate limit. Document it in a header comment; AI-8 will mention it in the README.
3. **Prompts per subject** (`prompts/*.ts`, one small file per subject): math, physics, chemistry, biology, coding, languages, history, commerce, other. Two modes:
   - `answer`: complete solution, clear steps, final answer.
   - `learn`: same data, but steps written as guidance that teaches the method, with a short "try this next" check question per step. (The UI decides when to reveal.)
4. **Structured output:** ask the model for JSON matching `Answer` (`finalAnswer`, `steps[{title, body}]`, `summary`). Math in `$...$` / `$$...$$`. Write a robust parser: strip code fences, repair trailing commas, fall back to a single step containing the raw text if JSON fails. Unit-test this with Vitest.
5. **Vision:** if the provider supports images, send `imageDataUrl` as an image part. Otherwise rely on the OCR text.
6. **Cache:** normalise the question (trim, lowercase, collapse spaces, plus subject + mode) -> hash -> `getCachedAnswer` / `putCachedAnswer` from db. Same question again = instant, offline too.
7. **Offline queue:** if offline or the network call fails, `queuePending(...)` and return `{ queued: true }`. `flushPending()` runs on the `online` event and on app start; each result is saved with `saveQuestion` + `saveAnswer` and a toast appears.
8. `followUp`, `generateCards`, `generateQuiz`, `similarProblem` per the contract (AI-5 and AI-7 depend on them). Keep conversation history per answer.
9. **Errors:** friendly messages for bad key, rate limit, timeout, offline, blocked by CORS. **Never log keys, headers or full request bodies.** Support `AbortSignal` (a Cancel button).

### Build: free-tier fallback chain & key pool (`src/lib/ai/fallback/**`, `src/features/ai-settings/**`) - REQUIRED

The user runs on **free tiers**, which have per-minute and per-day limits, so the app must **never just fail**. It must automatically fall through a chain of models (and optionally keys/providers) until one answers.

Facts to design around (verified Nov 2026; Google changes these often, so nothing may be hard-coded):
- Gemini's free tier covers certain Flash / Flash-Lite / Pro text models. Per-model limits are **no longer published**; they are visible per project in the AI Studio rate-limit console. Preview/experimental models are limited more tightly.
- **Limits are per Google project, not per API key.** Two keys from the same project share one quota. A key from a *different project of the user's own* has its own quota.
- Daily quotas reset at **midnight Pacific time**.
- Models can disappear from the free tier or return `limit: 0` / 404. Free-tier content may be used by Google to improve its products (show this notice once in the panel).

1. **`ModelSlot` = `{ provider, model, keyId }`.** The user keeps an ordered, editable **chain** of slots (drag to reorder, toggle on/off). Provide a sensible **suggested default chain of several Gemini Flash / Flash-Lite / Pro models, strongest first**, but names are only suggestions. Add a **"Fetch available models"** button that calls Gemini's ListModels with the user's key, keeps models that support `generateContent`, and lets the user tick which to add. This is how the app survives model renames.
2. **Key pool:** the user may add several Gemini keys, each labelled with its project (e.g. "Project A"), because quota is per project. Rotate across keys *within* a model before moving to the next model. Keys are stored on the device only; never logged, never shown in full (mask all but the last 4).
3. **`callWithFallback(request)`** tries slots in order and classifies every failure:
   - **429 / RESOURCE_EXHAUSTED / quota:** put that slot in **cooldown** and move on. Parse `retryDelay` from the error body if present. If the message says per-day / daily, cool down until the next midnight Pacific; otherwise use the retry delay, or 60 s by default.
   - **500 / 503 / overloaded / timeout / network error:** retry **once** with short backoff + jitter, then move on (no long cooldown, maybe 30 s).
   - **404 / model not found / deprecated / `limit: 0`:** mark the slot **unavailable** (skip it, show a "model unavailable" badge) and move on.
   - **400 / 401 / 403 invalid or blocked key:** **do not** fall through blindly. Mark that key invalid, skip only that key's slots, and show a clear message to fix the key.
   - **Safety/blocked-content response:** do not fall through; show the message.
   - Cooldown state is **persisted** (survives reload) and visible in the UI.
4. **Last resort chain:** after all Gemini slots, optionally continue to other providers the user enabled (OpenAI-compatible endpoints such as OpenRouter or Groq free models). If **everything** is cooling down or failing, don't show a dead error: `queuePending(...)`, tell the user "All free limits are used up - I'll answer automatically when quota resets (about HH:MM)", and let `flushPending()` retry when the earliest cooldown ends or the app comes back online.
5. **Save quota proactively:**
   - Check the **cache** first (already in item 6 above).
   - Client-side **throttle** (token bucket, configurable) so rapid taps can't burn the per-minute limit; disable the Send button while a request is in flight and de-duplicate identical requests.
   - Keep prompts compact; prefer sending OCR **text** instead of the image when the text is clear.
   - Route cheap tasks (card generation, tag suggestions, "explain simpler") to lighter slots first if the user enabled "Save quota" mode.
6. **Transparency:** every `Answer` records which model answered in `Answer.model`. If a fallback model (not the first in the chain) answered, the answer screen shows a small, calm label "Answered by <model>". The math **verify** badge still applies. Never silently present a weaker model's answer as the primary one.
7. **`<AiSettingsPanel />`** (`src/features/ai-settings/**`, mounted in Settings by AI-1): provider choice, key pool (add / label / mask / delete / paste), the editable model chain with per-slot status (**Ready / Cooling down until HH:MM / Unavailable / Key invalid**), "Fetch available models", **"Test connection"** per slot, "Reset cooldowns", Save-quota mode, optional proxy URL, and a short "How to get a free key" help card (Google AI Studio -> Get API key; "create a key in a new project" for extra separate quota). Phone-friendly layout.
8. **Unit tests (Vitest, mocked `fetch`):** 429 -> next slot; daily-quota message -> cooldown until midnight Pacific; 503 -> one retry then next slot; 404 -> slot unavailable; 400 invalid key -> no fall-through for that key; all slots failing -> request queued and later flushed; cooldown persistence across reload; key rotation within a model; no key ever appears in logs or error messages.

### Build (`src/features/ask/**`) - route `/`
- Big calm text area, subject chips, Learn/Answer toggle, a **Scan** button slot (import `ScanButton` from `features/scan` once AI-4 pushes it; until then a placeholder), a Send button, "recent questions" list (from `listLibrary`).
- On submit: show a nice loading state with Cancel, then navigate to `/answer/:id`. If queued: show "Saved - will answer when you're online".
- Works on phone one-handed; keyboard shortcut Ctrl/Cmd+Enter on laptop.

### Done when
- With a real free Gemini key pasted in Settings, a typed math question returns a saved, parsed answer and opens `/answer/:id`.
- **Fallback demo:** with the first model deliberately set to an invalid/exhausted one, the app still answers from the next slot and shows "Answered by <model>". With every slot failing, the question is queued, not lost.
- Offline test: queue works and flushes on reconnect. Unit tests pass for the JSON parser and the cache hash.
