import { describe, expect, it } from 'vitest';
import { readPdf, type PdfOptions } from './readPdf';

const nodeLoader: PdfOptions['loader'] = async () => {
  const lib = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as typeof import('pdfjs-dist');
  lib.GlobalWorkerOptions.workerSrc = `file://${process.cwd()}/node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs`;
  return lib;
};

/** A one-page PDF with a real text layer, built by hand (xref offsets computed). */
function tinyPdf(text: string): Uint8Array {
  const stream = `BT /F1 18 Tf 20 100 Td (${text}) Tj ET`;
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let out = '%PDF-1.4\n'; const off: number[] = [];
  objs.forEach((o, i) => { off.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(out);
}

describe('readPdf', () => {
  it('extracts the text layer and counts pages', async () => {
    const r = await readPdf(tinyPdf('Mitochondria produce ATP for the cell'), { loader: nodeLoader });
    expect(r.pages).toBe(1);
    expect(r.text).toContain('Mitochondria produce ATP');
    expect(r.scanned).toEqual([]);
  });
  it('flags a page with almost no text as scanned', async () => {
    const r = await readPdf(tinyPdf('Hi'), { loader: nodeLoader });
    expect(r.scanned).toEqual([1]);
    expect(r.ocrUsed).toBe(0);
  });
});
