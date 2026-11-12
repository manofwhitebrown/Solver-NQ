import { describe, expect, it } from 'vitest';
import { localTesseractPaths } from './assets';

describe('localTesseractPaths', () => {
  it('builds absolute URLs under the app base', () => {
    const p = localTesseractPaths('/Solver-NQ/', 'https://x.github.io/Solver-NQ/', true, 'eng');
    expect(p.workerPath).toBe('https://x.github.io/Solver-NQ/tesseract/worker.min.js');
    expect(p.corePath.endsWith('tesseract-core-simd-lstm.wasm.js')).toBe(true);
    expect(p.langPath).toBe('https://x.github.io/Solver-NQ/tesseract/lang');
  });
  it('uses the plain core without SIMD and no local data for other languages', () => {
    const p = localTesseractPaths('/', 'http://localhost/', false, 'fra');
    expect(p.corePath).toBe('http://localhost/tesseract/tesseract-core-lstm.wasm.js');
    expect('langPath' in p).toBe(false);
  });
});
