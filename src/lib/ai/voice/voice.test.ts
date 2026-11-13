import { afterEach, describe, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({ isNative: false }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.isNative } }));
const plugin = vi.hoisted(() => {
  const listeners: Record<string, (d: unknown) => void> = {};
  return {
    listeners,
    available: vi.fn(async () => ({ available: true })),
    checkPermissions: vi.fn(async () => ({ speechRecognition: 'granted' })),
    requestPermissions: vi.fn(async () => ({ speechRecognition: 'granted' })),
    start: vi.fn(async () => ({})),
    stop: vi.fn(async () => {}),
    removeAllListeners: vi.fn(async () => {}),
    addListener: vi.fn(async (name: string, fn: (d: unknown) => void) => { listeners[name] = fn; return { remove: async () => {} }; }),
  };
});
vi.mock('@capacitor-community/speech-recognition', () => ({ SpeechRecognition: plugin }));

import { VoiceError, joinSpoken, startVoice, voiceSupported, webErrorCode } from './speech';

class FakeRec {
  static last: FakeRec;
  lang = ''; interimResults = false; continuous = true; maxAlternatives = 0;
  onresult: ((e: { results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  constructor() { FakeRec.last = this; }
  start() { this.started = true; }
  stop() { this.onend?.(); }
  abort() {}
  say(...parts: string[]) { this.onresult?.({ results: parts.map(p => ({ isFinal: false, 0: { transcript: p } })) }); }
}
const handlers = () => ({ onText: vi.fn(), onEnd: vi.fn(), onError: vi.fn() });

afterEach(() => { vi.unstubAllGlobals(); native.isNative = false; for (const k of Object.keys(plugin.listeners)) delete plugin.listeners[k]; vi.clearAllMocks(); });

describe('joinSpoken', () => {
  it('adds spoken words after the typed text with one space', () => {
    expect(joinSpoken('', 'solve two x')).toBe('solve two x');
    expect(joinSpoken('Solve', ' 2x + 5 = 17 ')).toBe('Solve 2x + 5 = 17');
    expect(joinSpoken('Solve   \n', 'it')).toBe('Solve it');
    expect(joinSpoken('typed', '   ')).toBe('typed');
  });
});

describe('web speech', () => {
  it('is unsupported without the browser API, and says so', async () => {
    expect(voiceSupported()).toBe(false);
    await expect(startVoice(handlers())).rejects.toMatchObject({ code: 'unsupported' });
  });
  it('fills text as it is heard, ends once, and reports the final text once', async () => {
    vi.stubGlobal('webkitSpeechRecognition', FakeRec);
    expect(voiceSupported()).toBe(true);
    const h = handlers();
    const s = await startVoice(h, 'en-IN');
    expect(FakeRec.last.started).toBe(true);
    expect(FakeRec.last.lang).toBe('en-IN');
    expect(FakeRec.last.interimResults).toBe(true);
    FakeRec.last.say('solve');
    FakeRec.last.say('solve ', 'two x');
    s.stop();
    expect(h.onText.mock.calls).toEqual([['solve', false], ['solve two x', false], ['solve two x', true]]);
    expect(h.onEnd).toHaveBeenCalledTimes(1);
    expect(h.onError).not.toHaveBeenCalled();
  });
  it('maps browser errors to plain messages (denied mic, silence, offline)', async () => {
    vi.stubGlobal('SpeechRecognition', FakeRec);
    const h = handlers();
    await startVoice(h);
    FakeRec.last.onerror?.({ error: 'not-allowed' });
    FakeRec.last.onend?.();
    expect(h.onError.mock.calls[0][0]).toBeInstanceOf(VoiceError);
    expect(h.onError.mock.calls[0][0].code).toBe('denied');
    expect(h.onText).not.toHaveBeenCalled(); // no final text after an error
    expect(h.onEnd).toHaveBeenCalledTimes(1);
    expect([webErrorCode('no-speech'), webErrorCode('network'), webErrorCode('audio-capture'), webErrorCode('weird')]).toEqual(['no_speech', 'offline', 'no_mic', 'failed']);
  });
});

describe('native (Android plugin)', () => {
  it('asks for permission, starts with partial results and no popup, and delivers the final text on stop', async () => {
    native.isNative = true;
    plugin.checkPermissions.mockResolvedValueOnce({ speechRecognition: 'prompt' });
    const h = handlers();
    const s = await startVoice(h, 'en-US');
    expect(plugin.requestPermissions).toHaveBeenCalledTimes(1);
    expect(plugin.start).toHaveBeenCalledWith({ language: 'en-US', maxResults: 1, partialResults: true, popup: false });
    plugin.listeners.partialResults({ matches: ['what is'] });
    plugin.listeners.partialResults({ matches: ['what is 6 times 7'] });
    s.stop();
    expect(plugin.stop).toHaveBeenCalled();
    plugin.listeners.listeningState({ status: 'stopped' });
    plugin.listeners.listeningState({ status: 'stopped' }); // a repeated event must not repeat the end
    await Promise.resolve(); await Promise.resolve();
    expect(h.onText.mock.calls.at(-1)).toEqual(['what is 6 times 7', true]);
    expect(h.onEnd).toHaveBeenCalledTimes(1);
  });
  it('refused permission and unavailable recognizer reject with a plain reason and never start', async () => {
    native.isNative = true;
    plugin.checkPermissions.mockResolvedValueOnce({ speechRecognition: 'denied' });
    plugin.requestPermissions.mockResolvedValueOnce({ speechRecognition: 'denied' });
    await expect(startVoice(handlers())).rejects.toMatchObject({ code: 'denied' });
    plugin.available.mockResolvedValueOnce({ available: false });
    await expect(startVoice(handlers())).rejects.toMatchObject({ code: 'unsupported' });
    expect(plugin.start).not.toHaveBeenCalled();
  });
  it('a failed start ends the session and rejects', async () => {
    native.isNative = true;
    plugin.start.mockRejectedValueOnce(new Error('busy'));
    const h = handlers();
    await expect(startVoice(h)).rejects.toMatchObject({ code: 'failed' });
    expect(h.onEnd).toHaveBeenCalledTimes(1);
  });
});
