# Phase 3 fix round + Phase 4 split (written by AI-3 from the user's QA report)

Rules are unchanged: `docs/CONTRIBUTING-AI.md`. Own paths only, `[AI-n]` commits, `pull --rebase`, typecheck + build + tests before push, update `docs/status/AI-n.md`. No secrets in the repo.

## Bugs from the QA report (B1-B7) and their owners
| Bug | What | Owner |
|---|---|---|
| B1 | Scan crop box starts 5% inset (`FULL` in `ScanPage.tsx`) and cuts first/last letters. Default must be the full image (0,0,1,1) | AI-4 |
| B2 | Scan "Ask" only moves text into the Ask box; it must prefill AND submit (or label it "Send to Ask") | AI-4 (+AI-2 for `prefill.ts`) |
| B3 | "Ready to work offline" bubble (`src/sw/UpdatePrompt.tsx`) covers bottom buttons, never auto-dismisses | AI-8 |
| B4 | Truncated/empty Gemini reply saved as a real answer; check `finishReason` (MAX_TOKENS, empty text) in `slotCall.ts`/`parse.ts`; same for "Read with AI" transcription | AI-2 (+AI-4 for transcription) |
| B5 | After retries on 5xx/network the app says "all free limits are used up"; only say that when every failure was a 429/quota | AI-2 |
| B6 | Bad key shows "key rejected" and "next model will answer" together; stop the chain on auth errors | AI-2 |
| B7 | "Go to library" / "Add your first note" links are 19 px tall; wrong file type on scan shows no message | AI-1 (links, shared UI), AI-4 (file-type message) |

## Phase 4 split (optional extras, v1.1)
| Extra | Owner |
|---|---|
| Cloud sync of the library (GitHub Gist), builds on backup v2 | AI-3 |
| Share-to-app target ("share a photo to Solver-NQ"), Android intent filter | AI-4 + AI-8 |
| Streaming answers (was skipped in Phase 2) | AI-2 |
| Tablet two-pane layouts for Library/Answer | AI-1 + AI-5 |
| Voice input on the Ask screen | AI-2 |
| UI language pack (Hindi/Telugu/Urdu first) | AI-1 |
| Study-pack PDF scale + Word export polish | AI-6 |
| Reminder after reboot, deck sharing, review stats v2 | AI-7 |

Each AI: regression test for every bug you fix (the QA report items must stay fixed), then the Phase 4 item.
