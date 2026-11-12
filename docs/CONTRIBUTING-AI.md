# The 8-AI rules (short form)

1. Only edit paths you own (see the ownership table in the task files). Need something elsewhere? Write it under "Needs from others" in your status file.
2. Wait for `SCAFFOLD READY` in `docs/status/AI-1.md` before pushing code.
3. Small commits, message `[AI-x] what changed`, always `pull --rebase` first.
4. `npm run typecheck` and `npm run build` must pass before every push.
5. Update `docs/status/AI-x.md` after every push (Done / In progress / Needs from others / Notes for the manager).
6. No secrets, no files over 1 MB, no `node_modules` in git.
7. Plain TypeScript, small files (~200 lines), exact-pinned dependencies.
