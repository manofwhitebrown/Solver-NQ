// Turn a ListModels result into a sensible chain. Names are never hard-coded as truth:
// we rank whatever Google currently lists. Strongest first, preview/experimental last.
const SKIP = /image|tts|embed|live|audio|robotics|computer-use|imagen|veo|lyria|aqa|learnlm|gemma|vision-only|thinking-exp/i;

/**
 * GUESSED names (from third-party pages, not from Google). Every slot built from them is marked
 * `verified: false`, ranks after any verified model, and is dropped as soon as ListModels does not show it.
 */
export const SUGGESTED_MODELS = [
  'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite',
];

function version(m: string): number {
  const v = /gemini-(\d+)(?:\.(\d+))?/.exec(m);
  return v ? Number(v[1]) + Number(v[2] ?? 0) / 100 : 0;
}
function tier(m: string): number { return /flash-lite/.test(m) ? 1 : /flash/.test(m) ? 2 : /pro/.test(m) ? 3 : 0; }
const isPreview = (m: string) => /preview|exp/.test(m);

export function isUsableModel(m: string): boolean { return /^gemini-/.test(m) && !SKIP.test(m); }

/** Ranked chain: stable before preview, then newer first, then flash > flash-lite > pro (pro is rarely free). */
export function rankModels(models: string[]): string[] {
  const order = (m: string) => (tier(m) === 3 ? 0 : tier(m) === 2 ? 3 : 2);
  return models.filter(isUsableModel).sort((a, b) =>
    Number(isPreview(a)) - Number(isPreview(b)) || version(b) - version(a) || order(b) - order(a) || a.localeCompare(b));
}

/** Few enough to be a useful default: the top flash and flash-lite models only. */
export function defaultPick(models: string[]): string[] {
  const ranked = rankModels(models).filter(m => tier(m) === 2 || tier(m) === 1);
  const flash = ranked.filter(m => tier(m) === 2).slice(0, 2);
  const lite = ranked.filter(m => tier(m) === 1).slice(0, 2);
  return [...flash, ...lite];
}

/** Models Google has retired: never added from old settings. (gemini-2.0-flash was shut down in June 2026.) */
export const isRetiredModel = (m: string) => /^gemini-(1\.|2\.0)/.test(m);

/** Unverified (guessed) slots never go before a verified one. Stable: the user's order is kept inside each group. */
export function verifiedFirst<T extends { verified?: boolean }>(slots: T[]): T[] {
  return [...slots].sort((a, b) => Number(a.verified === false) - Number(b.verified === false));
}
