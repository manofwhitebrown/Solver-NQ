## Done
- Cloned repo; main has only README and docs, no scaffold yet.
- `verify()` implemented in src/lib/verify (pushed) (19 Vitest cases passing: arithmetic, equations, derivatives, integrals, division by zero, multiple roots, extraneous roots, units, rounding).
## In progress
- tts.ts (speak-math + web/Android interface), then graph plotter, then the answer view.
## Needs from others
- (none)
## Notes for the manager
- verify only returns `match` when claimed solutions satisfy the equation AND no other root is found by sampling in [-1000, 1000]; word problems, units, systems, inequalities and ambiguous `log` return `unchecked`.
- mathjs runs with the dangerous functions disabled and complex results turned into NaN.
