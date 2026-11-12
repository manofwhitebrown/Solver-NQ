import { useEffect, useState } from 'react';
import { Button, Spinner, toast } from '@/components/ui';
import { friendlyMessage, OcrError } from '@/lib/ocr';
import { openPdf, renderPage } from './pdfPages';

interface Props { file: Blob; onPage: (img: Blob) => void; onCancel: () => void }

export function PdfPicker({ file, onPage, onCancel }: Props) {
  const [doc, setDoc] = useState<Awaited<ReturnType<typeof openPdf>> | null>(null);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let live = true;
    openPdf(file).then(d => { if (!live) return; if (d.numPages < 1) throw new OcrError('empty-pdf'); setDoc(d); }).catch(e => { toast(friendlyMessage(e), 'error'); onCancel(); });
    return () => { live = false; };
  }, [file, onCancel]);

  useEffect(() => {
    if (!doc) return;
    let live = true, url = '';
    setBusy(true);
    renderPage(doc, page, 0.8).then(b => {
      if (!live) return;
      url = URL.createObjectURL(b); setPreview(url); setBusy(false);
    }).catch(() => { setBusy(false); toast('That page would not load.', 'error'); });
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [doc, page]);

  const use = async () => {
    if (!doc) return;
    setBusy(true);
    try { onPage(await renderPage(doc, page, 2)); } catch (e) { toast(friendlyMessage(e), 'error'); setBusy(false); }
  };

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-ink-soft">{doc ? `Page ${page} of ${doc.numPages}` : 'Opening PDF…'}</p>
      <div className="flex min-h-40 items-center justify-center rounded-md bg-raised">
        {busy ? <Spinner /> : <img src={preview} alt={`PDF page ${page}`} className="max-h-[50vh] object-contain" />}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={page <= 1 || busy} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="secondary" disabled={!doc || page >= doc.numPages || busy} onClick={() => setPage(p => p + 1)}>Next</Button>
        <Button onClick={use} disabled={!doc || busy}>Use this page</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
