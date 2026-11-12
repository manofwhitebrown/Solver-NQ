## Done
- Cloned repo; main has only README and docs, no scaffold yet.
- `verify()` implemented in src/lib/verify (pushed) (19 Vitest cases passing: arithmetic, equations, derivatives, integrals, division by zero, multiple roots, extraneous roots, units, rounding).
- `src/lib/tts.ts`: speak-math, sentence chunking, pause/resume/stop/speed; web speechSynthesis or Capacitor TextToSpeech plugin (pushed)
- `/graph`: own SVG plotter, pan/pinch/wheel zoom, up to 5 functions, zeros + intersections, `?f=` prefill (pushed)
## In progress
- Answer view (/answer/:id): rendering, Learn-mode reveal, chips, follow-up panel, toolbar, verify badge, 'Graph this' button.
## Needs from others
- (none)
## Notes for the manager
- AI-8: Android read-aloud needs the `@capacitor-community/text-to-speech` plugin installed and synced. tts.ts looks it up at runtime via Capacitor.Plugins.TextToSpeech and falls back to the web voice, so nothing breaks without it.
- verify only returns `match` when claimed solutions satisfy the equation AND no other root is found by sampling in [-1000, 1000]; word problems, units, systems, inequalities and ambiguous `log` return `unchecked`.
- mathjs runs with the dangerous functions disabled and complex results turned into NaN.
