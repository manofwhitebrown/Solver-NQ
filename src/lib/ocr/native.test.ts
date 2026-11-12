import { beforeEach, describe, expect, it, vi } from 'vitest';

const detectText = vi.fn();
let plugin: unknown = { detectText };
vi.mock('@pantrist/capacitor-plugin-ml-kit-text-recognition', () => ({
  get CapacitorPluginMlKitTextRecognition() { return plugin; },
}));
const web = vi.fn();
vi.mock('./web', () => ({ recognizeWeb: (...a: unknown[]) => web(...a) }));
let native = true;
vi.mock('./platform', () => ({ isNative: () => native }));
vi.mock('@/lib/settings', () => ({ getSettings: () => ({ ocrLang: 'eng' }) }));

import { recognize } from './index';
import { recognizeNative } from './native';

const img = 'data:image/jpeg;base64,AAAA';

beforeEach(() => {
  detectText.mockReset(); web.mockReset();
  plugin = { detectText }; native = true;
  web.mockResolvedValue({ text: 'from tesseract', confidence: 80 });
});

describe('recognizeNative', () => {
  it('returns trimmed text and strips the data-url prefix', async () => {
    detectText.mockResolvedValue({ text: '  x = 2 \n' });
    expect(await recognizeNative(img)).toEqual({ text: 'x = 2', confidence: 85 });
    expect(detectText).toHaveBeenCalledWith({ base64Image: 'AAAA' });
  });
  it('reports confidence 0 for an empty result', async () => {
    detectText.mockResolvedValue({ text: '' });
    expect(await recognizeNative(img)).toEqual({ text: '', confidence: 0 });
  });
  it('throws OcrError when the plugin is missing', async () => {
    plugin = undefined;
    await expect(recognizeNative(img)).rejects.toMatchObject({ code: 'ocr-failed' });
  });
  it('throws OcrError on permission denied or any plugin error', async () => {
    detectText.mockRejectedValue(new Error('Permission denied'));
    await expect(recognizeNative(img)).rejects.toMatchObject({ code: 'ocr-failed' });
  });
});

describe('recognize (fallback)', () => {
  it('uses native when it finds text, no backup flag', async () => {
    detectText.mockResolvedValue({ text: 'hello' });
    const r = await recognize(img);
    expect(r).toEqual({ text: 'hello', confidence: 85 });
    expect(web).not.toHaveBeenCalled();
  });
  it.each([
    ['empty result', () => detectText.mockResolvedValue({ text: '' })],
    ['plugin throws', () => detectText.mockRejectedValue(new Error('boom'))],
    ['permission denied', () => detectText.mockRejectedValue(new Error('permission denied'))],
    ['plugin missing', () => { plugin = undefined; }],
  ])('falls back to Tesseract on %s', async (_n, setup) => {
    setup();
    const r = await recognize(img);
    expect(r).toEqual({ text: 'from tesseract', confidence: 80, backup: true });
  });
  it('goes straight to web on non-native platforms', async () => {
    native = false;
    const r = await recognize(img);
    expect(detectText).not.toHaveBeenCalled();
    expect(r.backup).toBeUndefined();
  });
});
