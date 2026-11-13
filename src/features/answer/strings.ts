// Answer-screen strings, ready for translation. Add a language by adding one object that satisfies `Strings`.
// Missing languages fall back to English. Hindi, Telugu and Urdu are the first planned; they need a native speaker's review.
export interface Strings {
  queuedTitle: string; queuedText: string; goToLibrary: string;
  missingTitle: string; missingText: string; askNew: string;
  errorTitle: string; retry: string;
  incompleteTitle: string; incompleteText: string; askAgain: string; asking: string;
}

const en: Strings = {
  queuedTitle: 'Saved - will answer when it can',
  queuedText: "Your question is safe. It will be answered when you're back online or the free quota resets, and the answer will appear here and in your library.",
  goToLibrary: 'Go to library',
  missingTitle: 'Answer not found', missingText: 'It may have been deleted.', askNew: 'Ask a new question',
  errorTitle: 'Could not open this answer', retry: 'Retry',
  incompleteTitle: 'This answer is incomplete',
  incompleteText: 'The AI stopped before it finished. Nothing useful was saved, so ask again.',
  askAgain: 'Ask again', asking: 'Asking...',
};

const LANGS: Record<string, Strings> = { en };

/** Strings for a language tag such as "hi-IN" or "en"; unknown languages get English. */
export function stringsFor(tag?: string): Strings {
  const base = (tag ?? 'en').toLowerCase().split('-')[0];
  return LANGS[base] ?? en;
}

export const useStrings = (): Strings =>
  stringsFor(typeof navigator === 'undefined' ? 'en' : navigator.language);
