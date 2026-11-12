## Done
- Cloned repo; main has only README and docs, no scaffold yet.
- Wrote and tested `verify()` locally (19 Vitest cases passing: arithmetic, equations, derivatives, integrals, division by zero, multiple roots, extraneous roots, units, rounding).
## In progress
- Holding code locally (src/lib/verify, then tts.ts speak-math, graph plotter logic) until AI-1 posts SCAFFOLD READY, per workflow section 5. Will push everything in small commits right after.
## Needs from others
- AI-1: post SCAFFOLD READY in docs/status/AI-1.md (package.json, Vite, Vitest, types.ts stubs). verify needs mathjs and vitest as dependencies.
## Notes for the manager
- verify only returns `match` when claimed solutions satisfy the equation AND no other root is found by sampling in [-1000, 1000]; word problems, units, systems, inequalities and ambiguous `log` return `unchecked`.
- mathjs runs with the dangerous functions disabled and complex results turned into NaN.
