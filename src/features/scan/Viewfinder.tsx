/** Decorative camera frame shown on the capture step: corner brackets around a sample question and a scan line. */
export function Viewfinder() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl bg-raised ring-1 ring-line [@media(max-height:560px)]:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_40%,rgb(var(--accent-2)/.12),transparent)]" />
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 space-y-3">
        <div className="h-3 w-4/5 rounded-full bg-ink/15" />
        <div className="h-3 w-full rounded-full bg-ink/15" />
        <div className="h-3 w-3/5 rounded-full bg-ink/15" />
        <div className="flex gap-2 pt-1"><div className="h-6 w-14 rounded-md bg-accent/20" /><div className="h-6 w-10 rounded-md bg-accent/20" /></div>
      </div>
      <div className="absolute inset-x-8 h-0.5 animate-[scan-line_2.8s_ease-in-out_infinite] rounded-full bg-accent shadow-[0_0_14px_rgb(var(--accent)/.7)]" />
      {(['left-5 top-5 border-l-4 border-t-4 rounded-tl-xl', 'right-5 top-5 border-r-4 border-t-4 rounded-tr-xl', 'left-5 bottom-5 border-l-4 border-b-4 rounded-bl-xl', 'right-5 bottom-5 border-r-4 border-b-4 rounded-br-xl'] as const).map(c => (
        <span key={c} className={`absolute h-9 w-9 border-accent ${c}`} />
      ))}
    </div>
  );
}
