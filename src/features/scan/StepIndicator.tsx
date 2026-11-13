const STEPS = ['Capture', 'Crop', 'Check text'];
// R1: below 400 px only the current step shows its name; the others show just the number (or tick).
// Before this, "3 Check text" made /scan 363 px wide on a 320 px phone.
export const LABEL_HIDDEN_WHEN_NARROW = 'max-[399px]:data-[narrow-hidden]:sr-only';

/** 1 Capture, 2 Crop, 3 Check text. `step` is 1-based. A connected track: done = brand tick, now = brand number. */
export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center text-sm" aria-label="Steps">
      {STEPS.map((name, i) => {
        const n = i + 1;
        const on = n === step;
        const done = n < step;
        return (
          <li key={name} className={`flex items-center ${n < 3 ? 'min-w-0 flex-1' : 'shrink-0'}`} aria-current={on ? 'step' : undefined}>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-caption font-semibold transition ${on ? 'brand-grad text-white shadow-soft' : done ? 'bg-accent text-white' : 'bg-raised text-muted ring-1 ring-line'}`}>
                {done ? '✓' : n}
              </span>
              <span className={`${LABEL_HIDDEN_WHEN_NARROW} ${on ? 'font-semibold text-ink' : done ? 'font-semibold text-ink-2' : 'text-muted'}`.trim()} data-narrow-hidden={on ? undefined : ''}>{name}</span>
            </span>
            {n < 3 && <span className={`mx-3 h-0.5 min-w-3 flex-1 rounded-full ${done ? 'bg-accent' : 'bg-line'}`} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
