import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Spinner, toast } from '@/components/ui';
import { friendlyMessage, recognize } from '@/lib/ocr';
import { CropEditor } from './CropEditor';
import { cropBlob, loadBitmap, rotate90 } from './imageTools';
import type { Rect } from './cropMath';
import { PdfPicker } from './PdfPicker';
import { ResultCard, type ScanItem } from './ResultCard';
import type { ScanResult } from './result';

const FULL: Rect = { x: 0.05, y: 0.05, w: 0.9, h: 0.9 };

export function ScanPage() {
  const nav = useNavigate();
  const [source, setSource] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [rect, setRect] = useState<Rect>(FULL);
  const [enhance, setEnhance] = useState(true);
  const [items, setItems] = useState<ScanItem[]>([]);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);

  const cancelPdf = useCallback(() => setPdf(null), []);
  const open = useCallback(async (blob: Blob) => {
    if (blob.type === 'application/pdf') { setPdf(blob); return; }
    setLoading(true);
    try {
      (await loadBitmap(blob)).close(); // validates size and that it decodes
      setSource(blob); setRect(FULL);
    } catch (e) { toast(friendlyMessage(e), 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!source) { setUrl(''); return; }
    const u = URL.createObjectURL(source);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [source]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])].find(x => x.type.startsWith('image/'));
      if (f) { e.preventDefault(); void open(f); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [open]);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) void open(f);
  };

  const patch = (id: string, p: Partial<ScanItem>) => setItems(xs => xs.map(x => (x.id === id ? { ...x, ...p } : x)));

  const addCrop = async () => {
    if (!source) return;
    const id = crypto.randomUUID();
    try {
      const c = await cropBlob(source, rect, enhance);
      setItems(xs => [...xs, { id, dataUrl: c.dataUrl, text: '', confidence: 0, busy: true }]);
      try {
        const r = await recognize(c.ocrBlob);
        patch(id, { text: r.text, confidence: r.confidence, busy: false });
      } catch (e) {
        patch(id, { busy: false });
        toast(friendlyMessage(e), 'error');
      }
    } catch (e) { toast(friendlyMessage(e), 'error'); }
  };

  const send = (text: string, dataUrl: string) => {
    const state: ScanResult = { text, imageDataUrl: dataUrl };
    nav('/', { state });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = [...e.dataTransfer.files].find(x => x.type.startsWith('image/') || x.type === 'application/pdf');
    if (f) void open(f); else toast('Please drop an image or PDF file.', 'error');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4"
      onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
      <h1 className="text-xl font-semibold">Scan a question</h1>
      {pdf ? (
        <PdfPicker file={pdf} onCancel={cancelPdf} onPage={img => { setPdf(null); void open(img); }} />
      ) : !source ? (
        <Card className={`space-y-4 p-6 text-center ${dragging ? 'ring-2 ring-accent' : ''}`}>
          <p className="text-ink-soft">Take a photo, choose an image, paste one, or drop it here.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => cam.current?.click()}>Take a photo</Button>
            <Button variant="secondary" onClick={() => gal.current?.click()}>Choose image or PDF</Button>
          </div>
          {loading && <Spinner />}
          <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
          <input ref={gal} type="file" accept="image/*,application/pdf" hidden onChange={pick} />
        </Card>
      ) : (
        <div className="space-y-3">
          <CropEditor url={url} rect={rect} onChange={setRect} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={async () => { setSource(await rotate90(source)); setRect(FULL); }}>Rotate</Button>
            <Button variant={enhance ? 'primary' : 'secondary'} aria-pressed={enhance} onClick={() => setEnhance(v => !v)}>Enhance</Button>
            <Button onClick={addCrop}>{items.length ? 'Read another crop' : 'Read text'}</Button>
            <Button variant="ghost" onClick={() => { setSource(null); }}>New image</Button>
          </div>
        </div>
      )}
      {items.map(it => (
        <ResultCard key={it.id} item={it} onText={t => patch(it.id, { text: t })}
          onAsk={() => send(it.text.trim(), it.dataUrl)} onImageOnly={() => send('', it.dataUrl)}
          onRemove={() => setItems(xs => xs.filter(x => x.id !== it.id))} />
      ))}
    </div>
  );
}
