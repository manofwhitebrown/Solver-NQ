// Read-aloud: speaks answers with the browser voice, or the Capacitor TTS plugin on Android.
// Pause is done by stopping and resuming from the current sentence (works the same on both).

const GREEK = 'alpha|beta|gamma|delta|epsilon|theta|lambda|mu|sigma|omega|phi|pi|rho|tau';
const NAMED: Array<[RegExp, string]> = [
  [/\\cdot|\\times/g, ' times '], [/\\div/g, ' divided by '], [/\\pm/g, ' plus or minus '],
  [/\\leq?|≤/g, ' is at most '], [/\\geq?|≥/g, ' is at least '], [/\\neq|≠/g, ' does not equal '],
  [/\\approx|≈/g, ' is approximately '], [/\\to|\\rightarrow|→/g, ' goes to '], [/\\infty|∞/g, ' infinity '],
  [/\\int/g, ' integral of '], [/\\sum/g, ' sum of '], [/\\lim/g, ' limit '], [/\\ln/g, ' natural log of '],
  [/\\log/g, ' log '], [/\\sin/g, ' sine '], [/\\cos/g, ' cosine '], [/\\tan/g, ' tangent '],
];

/** LaTeX / math text -> words a speech engine reads sensibly ("x squared", not "x caret 2"). */
export function speakMath(latex: string): string {
  let s = latex;
  for (let i = 0; i < 5; i++) {
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, ' $1 over $2 ');
    s = s.replace(/\\sqrt\s*\[3\]\s*\{([^{}]*)\}/g, ' cube root of $1 ');
    s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, ' square root of $1 ');
  }
  s = s.replace(/\\(left|right)/g, '').replace(/\\[,;!]/g, ' ').replace(/\\text\{([^}]*)\}/g, ' $1 ');
  for (const [re, words] of NAMED) s = s.replace(re, words);
  s = s.replace(new RegExp(`\\\\(${GREEK})\\b`, 'g'), ' $1 ');
  s = s.replace(/√\s*\(?([\w.]+)\)?/g, ' square root of $1 ');
  s = s.replace(/\^\s*\{?\s*2\s*\}?/g, ' squared ').replace(/\^\s*\{?\s*3\s*\}?/g, ' cubed ');
  s = s.replace(/\^\s*\{?\s*(-?[\w.]+)\s*\}?/g, ' to the power $1 ');
  s = s.replace(/_\s*\{?\s*([\w.]+)\s*\}?/g, ' sub $1 ');
  s = s.replace(/(^|[=(,])\s*-\s*(?=[\w(])/g, '$1 negative ');
  s = s.replace(/=/g, ' equals ').replace(/\+/g, ' plus ').replace(/-/g, ' minus ')
    .replace(/\*/g, ' times ').replace(/\//g, ' over ');
  s = s.replace(/[(){}\[\]\\]/g, ' ').replace(/(\d)([a-z])\b/gi, '$1 $2');
  return s.replace(/\s+/g, ' ').trim();
}

/** Markdown with $math$ -> plain speakable text. */
export function toSpeakable(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' (code block skipped). ')
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, m: string) => ` ${speakMath(m)}. `)
    .replace(/\$([^$\n]+?)\$/g, (_m, m: string) => ` ${speakMath(m)} `)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s*/gm, '').replace(/[*_>#]+/g, '')
    .replace(/^\s*[-•]\s+/gm, '').replace(/\s+/g, ' ').trim();
}

/** Split into sentence-sized chunks (long utterances get cut off by some engines). */
export function chunkText(text: string, max = 220): string[] {
  const out: string[] = [];
  for (const sentence of text.match(/[^.!?]+[.!?]*/g) ?? []) {
    let rest = sentence.trim();
    while (rest.length > max) {
      const cut = rest.lastIndexOf(' ', max) > 40 ? rest.lastIndexOf(' ', max) : max;
      out.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

interface Engine { speak(text: string, rate: number): Promise<void>; stop(): void }
type NativePlugin = { speak(o: { text: string; rate: number; lang: string }): Promise<void>; stop(): Promise<void> };

function nativePlugin(): NativePlugin | undefined {
  const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean; Plugins?: Record<string, NativePlugin> } }).Capacitor;
  return cap?.isNativePlatform?.() ? cap.Plugins?.TextToSpeech : undefined;
}

function pickEngine(): Engine | null {
  const native = nativePlugin();
  if (native) return {
    speak: (text, rate) => native.speak({ text, rate, lang: 'en-US' }).catch(() => undefined),
    stop: () => { void native.stop().catch(() => undefined); },
  };
  if (typeof speechSynthesis === 'undefined') return null;
  return {
    speak: (text, rate) => new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    }),
    stop: () => speechSynthesis.cancel(),
  };
}

export type TtsStatus = 'idle' | 'speaking' | 'paused';
let status: TtsStatus = 'idle';
let rate = 1;
let chunks: string[] = [];
let index = 0;
let run = 0;
const listeners = new Set<(s: TtsStatus) => void>();

function set(s: TtsStatus) { status = s; listeners.forEach((l) => l(s)); }

async function play() {
  const engine = pickEngine();
  if (!engine) { set('idle'); return; }
  const my = ++run;
  set('speaking');
  while (index < chunks.length && my === run) {
    await engine.speak(chunks[index], rate);
    if (my === run) index++;
  }
  if (my === run) set('idle');
}

export const tts = {
  isSupported: () => pickEngine() !== null,
  getStatus: () => status,
  getRate: () => rate,
  /** Speak markdown (math included). Replaces anything already playing. */
  speak(markdown: string) { tts.stop(); chunks = chunkText(toSpeakable(markdown)); index = 0; void play(); },
  pause() {
    if (status !== 'speaking') return;
    run++; pickEngine()?.stop(); set('paused');
  },
  resume() { if (status === 'paused') void play(); },
  stop() { run++; pickEngine()?.stop(); chunks = []; index = 0; set('idle'); },
  /** 0.5 - 2. Applies from the next sentence. */
  setRate(r: number) { rate = Math.min(2, Math.max(0.5, r)); },
  subscribe(l: (s: TtsStatus) => void) { listeners.add(l); return () => { listeners.delete(l); }; },
};
