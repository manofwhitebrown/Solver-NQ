import type { Subject } from '@/types';
import { cn } from './cn';

// One hue per subject. Decorative only (the subject name is always written next to it), so the tint
// is light and the glyph uses the page's ink color: contrast never depends on the hue.
const HUE: Record<Subject, { rgb: string; glyph: string }> = {
  math: { rgb: '79 110 229', glyph: '∑' },
  physics: { rgb: '14 165 200', glyph: '⚛' },
  chemistry: { rgb: '168 85 247', glyph: '⚗' },
  biology: { rgb: '34 170 100', glyph: '✿' },
  coding: { rgb: '245 120 60', glyph: '</>' },
  languages: { rgb: '236 72 153', glyph: 'Aあ' },
  history: { rgb: '196 140 40', glyph: '❖' },
  commerce: { rgb: '20 150 140', glyph: '₹' },
  other: { rgb: '100 116 139', glyph: '?' },
};

/** Rounded tile with a subject glyph. `size` is the tile edge in px. */
export function SubjectTile({ subject, size = 44, className }: { subject: Subject; size?: number; className?: string }) {
  const h = HUE[subject] ?? HUE.other;
  return (
    <span aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-md font-bold text-ink', className)}
      style={{ width: size, height: size, fontSize: size * (h.glyph.length > 1 ? 0.3 : 0.42),
        background: `linear-gradient(135deg, rgb(${h.rgb} / .26), rgb(${h.rgb} / .10))`, boxShadow: `inset 0 0 0 1px rgb(${h.rgb} / .28)` }}>
      {h.glyph}
    </span>
  );
}
