/** Labelled checkbox with a 44px touch target. */
export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px]">
      <input
        type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[var(--accent,#2f6f5e)]"
      />
      {label}
    </label>
  );
}
