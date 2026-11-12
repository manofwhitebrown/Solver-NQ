// Self-hosted Tesseract files in public/tesseract/ so the first scan works offline.
// Only English data is bundled; other languages download from the CDN once.
const SIMD_PROBE = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);

export const hasSimd = () => typeof WebAssembly === 'object' && WebAssembly.validate(SIMD_PROBE);

export function localTesseractPaths(base: string, origin: string, simd: boolean, lang: string) {
  const root = new URL(`${base.replace(/\/?$/, '/')}tesseract/`, origin).href;
  return {
    workerPath: `${root}worker.min.js`,
    corePath: `${root}${simd ? 'tesseract-core-simd-lstm.wasm.js' : 'tesseract-core-lstm.wasm.js'}`,
    ...(lang === 'eng' ? { langPath: `${root}lang` } : {}),
  };
}
