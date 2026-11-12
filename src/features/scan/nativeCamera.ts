import { OcrError } from '@/lib/ocr';

// Native camera / gallery on Android through @capacitor/camera (lazy). Returns a Blob, or null if cancelled.
export async function takeNativePhoto(source: 'camera' | 'gallery'): Promise<Blob | null> {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl, quality: 90, correctOrientation: true,
      source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
    });
    if (!photo.dataUrl) return null;
    return await (await fetch(photo.dataUrl)).blob();
  } catch (e) {
    const msg = String((e as Error)?.message ?? e).toLowerCase();
    if (msg.includes('cancel')) return null;
    if (msg.includes('denied') || msg.includes('permission')) throw new OcrError('permission');
    if (msg.includes('no camera') || msg.includes('not available')) throw new OcrError('no-camera');
    throw new OcrError('ocr-failed');
  }
}
