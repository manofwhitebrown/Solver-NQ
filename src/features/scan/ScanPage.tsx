import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionBar, Button, Card, PageHeader, Spinner, Stack, toast } from '@/components/ui';
import { useHideTabBar } from '@/app/tabbar';
import { transcribeImage } from '@/lib/ai';
import { friendlyMessage, OcrError, onOcrProgress, recognize } from '@/lib/ocr';
import { isNative } from '@/lib/ocr/platform';
import { CropEditor } from './CropEditor';
import { LangPacks } from './LangPacks';
import { StepIndicator } from './StepIndicator';
import { blobToDataUrl, cropBlob, loadBitmap, rotate90 } from './imageTools';
import type { Rect } from './cropMath';
import { takeNativePhoto } from './nativeCamera';
import { PdfPicker } from './PdfPicker';
import { loadQueue, saveQueue } from './queue';
import { ResultCard, type ScanItem } from './ResultCard';
import type { ScanResult } from './result';

const FULL: Rect = { x: 0, y: 0, w: 1, h: 1 }; // whole image: an inset chopped the first and last letters of tight photos

export function ScanPage() {
  const nav = useNavigate();
  const [source, setSource] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [rect, setRect] = useState<Rect>(FULL);
  const [enhance, setEnhance] = useState(true);
  const [items, setItems] = useState<ScanItem[]>(loadQueue);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);

  const cancelPdf = useCallback(() => setPdf(null), []);
  const open = useCallback(async (blob: Blob) => {
    setFileError('');
    if (blob.type === 'application/pdf') { setPdf(blob); return; }
    if (!/^image\/(jpeg|png|webp|gif|bmp|heic|heif)$/.test(blob.type)) { const m = friendlyMessage(new OcrError('unsupported')); setFileError(m); toast(m, 'error'); return; }
    setLoading(true);
    try {
      (await loadBitmap(blob)).close(); // validates size and that it decodes
      setSource(blob); setRect(FULL);
    } catch (e) { const m = friendlyMessage(e); setFileError(m); toast(m, 'error'); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!source) { setUrl(''); return; }
    const u = URL.createObjectURL(source);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [source]);

  // Keep edits too, so leaving /scan by any route doesn't lose finished crops.
  useEffect(() => { saveQueue(items); }, [items]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])].find(x => x.type.startsWith('image/'));
      if (f) { e.preventDefault(); void open(f); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [open]);

  const native = async (src: 'camera' | 'gallery') => {
    try {
      const b = await takeNativePhoto(src);
      if (b) await open(b);
    } catch (e) { toast(friendlyMessage(e), 'error'); }
  };

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
        const off = onOcrProgress(p => patch(id, { progress: p }));
        const r = await recognize(c.ocrBlob).finally(off);
        patch(id, { text: r.text, confidence: r.confidence, busy: false });
        if (r.backup) toast('Using backup reader', 'info');
      } catch (e) {
        patch(id, { busy: false });
        toast(friendlyMessage(e), 'error');
      }
    } catch (e) { toast(friendlyMessage(e), 'error'); }
  };

  // One tap: turn a crop 90 degrees and read it again.
  const rotateItem = async (id: string) => {
    const it = items.find(x => x.id === id);
    if (!it) return;
    patch(id, { busy: true, progress: 0 });
    try {
      const off = onOcrProgress(p => patch(id, { progress: p }));
      const turned = await rotate90(await (await fetch(it.dataUrl)).blob());
      const dataUrl = await blobToDataUrl(turned);
      const r = await recognize(turned).finally(off);
      patch(id, { dataUrl, text: r.text, confidence: r.confidence, busy: false });
      if (r.backup) toast('Using backup reader', 'info');
    } catch (e) {
      patch(id, { busy: false });
      toast(friendlyMessage(e), 'error');
    }
  };

  // Vision AI reads handwriting and formulas better; the result fills the same editable box.
  const readWithAi = async (id: string) => {
    const it = items.find(x => x.id === id);
    if (!it) return;
    patch(id, { busy: true, progress: undefined });
    try {
      const text = await transcribeImage(it.dataUrl);
      patch(id, { text, confidence: 100, busy: false });
    } catch (e) {
      patch(id, { busy: false });
      toast(e instanceof Error ? e.message : 'The AI reader could not read this image.', 'error');
    }
  };

  // Ask for one crop; the rest stay queued and are restored when the user comes back to /scan.
  const send = (id: string, text: string, dataUrl: string) => {
    saveQueue(items.filter(x => x.id !== id));
    const state: ScanResult = { text, imageDataUrl: dataUrl, autoSend: true };
    nav('/', { state });
  };

  const removeItem = (id: string) => {
    const rest = items.filter(x => x.id !== id);
    setItems(rest); saveQueue(rest);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = [...e.dataTransfer.files].find(x => x.type.startsWith('image/') || x.type === 'application/pdf');
    if (f) void open(f); else toast('Please drop an image or PDF file.', 'error');
  };

  useHideTabBar(!!source && !pdf); // crop step: more room, the ActionBar sits at the bottom
  const step = !source ? 1 : items.length ? 3 : 2;
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const [hint, setHint] = useState(() => { try { return !localStorage.getItem('scanHintSeen'); } catch { return false; } });
  const [langs, setLangs] = useState(false);
  const dismissHint = () => { setHint(false); try { localStorage.setItem('scanHintSeen', '1'); } catch { /* storage unavailable */ } };

  return (
    <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
      className={source ? 'pb-24' : ''}>
      <PageHeader title="Scan a question" back={source && !pdf ? true : undefined} subtitle="Photograph it, crop it, check the text."
        actions={source && !pdf ? <Button variant="ghost" size="sm" onClick={() => setSource(null)} aria-label="New image">New</Button> : undefined} />
      <Stack gap={6}>
        <div className="[@media(max-height:500px)]:hidden"><StepIndicator step={step} /></div>
        {pdf ? (
          <PdfPicker file={pdf} onCancel={cancelPdf} onPage={img => { setPdf(null); void open(img); }} />
        ) : !source ? (
          <Card className={dragging ? 'ring-2 ring-accent' : ''}>
            <Stack gap={4} className="items-center text-center">
              <Button size="lg" block onClick={() => (isNative() ? native('camera') : cam.current?.click())}>Take a photo</Button>
              <Button variant="secondary" block onClick={() => gal.current?.click()}>Choose image or PDF</Button>
              <p className="text-sm text-ink-2">
                1. Take a photo. 2. Drag the corners around the question. 3. Check the text and ask.
                {!touch && ' You can also paste or drop an image here.'}
              </p>
              <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => setLangs(true)}>Scan languages</Button>
              {fileError && <p role="alert" className="text-base text-bad">{fileError}</p>}
              {loading && <Spinner />}
              <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
              <input ref={gal} type="file" accept="image/*,application/pdf" hidden onChange={pick} />
            </Stack>
          </Card>
        ) : (
          <Stack gap={3}>
            {hint && (
              <p className="flex items-center justify-between gap-3 rounded-md bg-accent-soft [@media(max-height:500px)]:hidden p-3 text-sm text-ink" role="status">
                <span>Drag the corners so the box covers just the question.</span>
                <Button variant="ghost" size="sm" className="whitespace-nowrap" onClick={dismissHint}>Got it</Button>
              </p>
            )}
            <CropEditor url={url} rect={rect} onChange={r => { setRect(r); if (hint) dismissHint(); }} />
          </Stack>
        )}
        {items.length > 1 && <p className="text-sm text-ink-2">{items.length} questions waiting. Ask one at a time; the rest will be here when you come back.</p>}
        {items.map(it => (
          <ResultCard key={it.id} item={it} onText={t => patch(it.id, { text: t })}
            onAsk={() => send(it.id, it.text.trim(), it.dataUrl)} onImageOnly={() => send(it.id, '', it.dataUrl)}
            onRemove={() => removeItem(it.id)} onRotate={() => void rotateItem(it.id)} onReadAi={() => void readWithAi(it.id)} />
        ))}
      </Stack>
      {source && !pdf && (
        <ActionBar>
          <Button variant="secondary" className="whitespace-nowrap !px-3" onClick={async () => { setSource(await rotate90(source)); setRect(FULL); }}>Rotate</Button>
          <Button variant={enhance ? 'secondary' : 'ghost'} className="whitespace-nowrap !px-3" aria-pressed={enhance} onClick={() => setEnhance(v => !v)}>Enhance</Button>
          <Button className="ml-auto min-w-0 flex-1 whitespace-nowrap !px-4 sm:flex-none" onClick={addCrop}>{items.length ? 'Read another' : 'Read text'}</Button>
        </ActionBar>
      )}
      <LangPacks open={langs} onClose={() => setLangs(false)} />
    </div>
  );
}
