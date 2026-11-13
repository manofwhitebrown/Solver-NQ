// Voice input for the Ask box (AI-2). Web: the browser's Web Speech API. Android: the Capacitor speech plugin.
// It only turns speech into text. Nothing here sends a question: the caller fills the box and the person presses Send.
import { Capacitor } from '@capacitor/core';

export type VoiceErrorCode = 'denied' | 'unsupported' | 'no_speech' | 'offline' | 'no_mic' | 'failed';

export const VOICE_MESSAGES: Record<VoiceErrorCode, string> = {
  denied: 'The microphone is turned off for this app. Allow it in your phone or browser settings, then try again.',
  unsupported: 'Voice input is not available here. Type the question instead.',
  no_speech: "I didn't hear anything. Tap the microphone and try again.",
  offline: 'Voice input needs an internet connection on this device. Type the question instead.',
  no_mic: 'No microphone was found.',
  failed: 'Voice input stopped working. Type the question instead.',
};

export class VoiceError extends Error {
  constructor(public code: VoiceErrorCode) { super(VOICE_MESSAGES[code]); this.name = 'VoiceError'; }
}

export interface VoiceHandlers {
  /** The text heard so far (the whole sentence, not just the new words). `final` is true once, at the end. */
  onText(text: string, final: boolean): void;
  /** Listening stopped (by the person, by silence, or after an error). Always called once. */
  onEnd(): void;
  onError(e: VoiceError): void;
}
export interface VoiceSession { stop(): void }

// Minimal shape of the browser API (not in the TypeScript DOM lib on every version).
interface WebResult { isFinal: boolean; 0: { transcript: string } }
interface WebRecognition {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<WebResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type WebCtor = new () => WebRecognition;

const webCtor = (): WebCtor | undefined => {
  const g = globalThis as unknown as { SpeechRecognition?: WebCtor; webkitSpeechRecognition?: WebCtor };
  return g.SpeechRecognition ?? g.webkitSpeechRecognition;
};
const isNative = () => { try { return Capacitor.isNativePlatform(); } catch { return false; } };

/** Can this device offer a microphone button? (Android: the plugin may still say unavailable when started.) */
export const voiceSupported = (): boolean => isNative() || !!webCtor();

/** Browser error names -> our codes. */
export function webErrorCode(name: string): VoiceErrorCode {
  if (name === 'not-allowed' || name === 'service-not-allowed') return 'denied';
  if (name === 'no-speech') return 'no_speech';
  if (name === 'network') return 'offline';
  if (name === 'audio-capture') return 'no_mic';
  if (name === 'language-not-supported') return 'unsupported';
  return 'failed';
}

/** Put spoken words after what is already in the box, with exactly one space between. */
export function joinSpoken(base: string, spoken: string): string {
  const s = spoken.trim();
  if (!s) return base;
  const b = base.replace(/\s+$/, '');
  return b ? `${b} ${s}` : s;
}

function startWeb(Ctor: WebCtor, h: VoiceHandlers, lang?: string): VoiceSession {
  const r = new Ctor();
  r.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
  let last = '', failed = false;
  r.onresult = e => {
    let t = '';
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    last = t;
    h.onText(t, false);
  };
  r.onerror = e => { failed = true; h.onError(new VoiceError(webErrorCode(e.error))); };
  r.onend = () => { if (!failed && last) h.onText(last, true); h.onEnd(); };
  try { r.start(); } catch { failed = true; h.onError(new VoiceError('failed')); h.onEnd(); }
  return { stop: () => { try { r.stop(); } catch { /* already stopped */ } } };
}

async function startNative(h: VoiceHandlers, lang?: string): Promise<VoiceSession> {
  const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
  try {
    if (!(await SpeechRecognition.available()).available) throw new VoiceError('unsupported');
    let perm = await SpeechRecognition.checkPermissions();
    if (perm.speechRecognition !== 'granted') perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== 'granted') throw new VoiceError('denied');
  } catch (e) {
    throw e instanceof VoiceError ? e : new VoiceError('failed');
  }
  let last = '', ended = false;
  const finish = async () => {
    if (ended) return;
    ended = true;
    await SpeechRecognition.removeAllListeners().catch(() => {});
    if (last) h.onText(last, true);
    h.onEnd();
  };
  await SpeechRecognition.addListener('partialResults', d => { last = d.matches?.[0] ?? last; h.onText(last, false); });
  await SpeechRecognition.addListener('listeningState', d => { if (d.status === 'stopped') void finish(); });
  try {
    // popup:false keeps the box on screen and lets partial results arrive.
    await SpeechRecognition.start({ language: lang, maxResults: 1, partialResults: true, popup: false });
  } catch {
    await finish();
    throw new VoiceError('failed');
  }
  return { stop: () => { void SpeechRecognition.stop().catch(() => {}); } };
}

/** Start listening. Rejects with a VoiceError when it cannot start (no support, permission refused). */
export async function startVoice(h: VoiceHandlers, lang?: string): Promise<VoiceSession> {
  if (isNative()) return startNative(h, lang);
  const Ctor = webCtor();
  if (!Ctor) throw new VoiceError('unsupported');
  return startWeb(Ctor, h, lang);
}
