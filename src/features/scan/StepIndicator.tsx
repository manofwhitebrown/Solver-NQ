const STEPS = ['Capture', 'Crop', 'Check text'];

/** 1 Capture, 2 Crop, 3 Check text. `step` is 1-based. */
export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-3 text-sm sm:gap-2" aria-label="Steps">
      {STEPS.map((name, i) => {
        const n = i + 1;
        const on = n === step;
        return (
          <li key={name} className="flex items-center gap-2 whitespace-nowrap" aria-current={on ? 'step' : undefined}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-caption font-semibold ${on ? 'bg-accent text-white' : n < step ? 'bg-accent-soft text-ink' : 'bg-raised text-muted'}`}>{n}</span>
            <span className={on ? 'font-semibold text-ink' : 'text-muted'}>{name}</span>
            {n < 3 && <span className="mx-1 hidden h-px w-3 bg-line-strong sm:inline-block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
