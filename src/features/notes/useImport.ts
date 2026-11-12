import { useState } from 'react';
import { friendlyMessage } from '@/lib/ocr';
import { cleanTranscript, isImageFile, isPdfFile, readTextFile, type NoteSource } from '@/lib/notes';

export interface Imported { text: string; source: NoteSource; info: string; name: string }

/** Reads a chosen file into text. PDF and OCR code is loaded only when needed. */
export function useImport(onDone: (r: Imported) => void) {
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  async function run(file: File) {
    setError(undefined); setBusy('Reading your file...');
    try {
      if (isPdfFile(file)) {
        const [{ readPdf }, ocr] = await Promise.all([import('@/lib/notes/readPdf'), import('@/lib/ocr')]);
        const r = await readPdf(await file.arrayBuffer(), {
          ocr: async (b) => (await ocr.recognize(b)).text,
          onProgress: (n, t) => setBusy(`Reading page ${n} of ${t}...`),
        });
        const scanNote = r.scanned.length ? ` ${r.scanned.length} scanned page${r.scanned.length > 1 ? 's' : ''}${r.ocrUsed ? ' read with OCR' : ' had no text'}.` : '';
        if (!r.text.trim()) throw new Error('This PDF has no readable text. Try a photo of the page instead.');
        onDone({ text: r.text, source: 'pdf', name: file.name, info: `Read ${r.pages} page${r.pages > 1 ? 's' : ''}.${scanNote}` });
      } else if (isImageFile(file)) {
        setBusy('Reading the picture...');
        const { recognize } = await import('@/lib/ocr');
        const r = await recognize(file);
        if (!r.text.trim()) throw new Error('No text found in that picture. Try a clearer photo.');
        onDone({ text: r.text, source: 'image', name: file.name, info: 'Read the picture with OCR. Please check the text below.' });
      } else {
        const t = await readTextFile(file);
        onDone({ text: t, source: 'file', name: file.name, info: 'File read.' });
      }
    } catch (e) {
      setError(e instanceof Error && !('code' in e) ? e.message : friendlyMessage(e));
    } finally { setBusy(undefined); }
  }
  return { run, busy, error, clean: cleanTranscript };
}
