import type { ExportItem } from './markdown';

// Which writing systems a text uses. The built-in PDF font only has Latin-1, so other scripts need the
// browser-drawn ("pretty") PDF, and Arabic/Urdu text needs right-to-left settings in DOCX.
const RE_COMPLEX = /[\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0EFF\uFB1D-\uFDFF\uFE70-\uFEFF]/; // Hebrew, Arabic, Indic, Thai, Lao...
const RE_RTL = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const RE_NON_LATIN1 = /[\u0100-\uFFFF]/;
const RE_MATHISH = /[\u2000-\u2BFF\u0370-\u03FF]/; // punctuation, arrows, maths operators, Greek: handled by pdfSafe

/** True when the text has letters that Helvetica cannot draw (Hindi, Telugu, Urdu, Chinese, ...). */
export function needsUnicodeFont(text: string): boolean {
  for (const ch of text) {
    if (!RE_NON_LATIN1.test(ch)) continue;
    if (RE_MATHISH.test(ch) || ch === '\u00A0') continue;
    return true;
  }
  return false;
}

export const isRtlText = (text: string): boolean => RE_RTL.test(text);
export const hasComplexScript = (text: string): boolean => RE_COMPLEX.test(text);

/** Share of right-to-left letters among all letters: a paragraph is RTL when it is mostly such letters. */
export function isRtlParagraph(text: string): boolean {
  let rtl = 0; let other = 0;
  for (const ch of text) {
    if (RE_RTL.test(ch)) rtl++;
    else if (/\p{L}/u.test(ch)) other++;
  }
  return rtl > 0 && rtl >= other;
}

/** True when any question or answer text in the export needs a font Helvetica does not have. */
export function itemsNeedUnicodeFont(items: ExportItem[]): boolean {
  return items.some(({ q, a }) =>
    needsUnicodeFont([q.text, a?.finalAnswer, a?.summary, ...(a?.steps ?? []).flatMap((s) => [s.title, s.body])].filter(Boolean).join('\n')));
}
