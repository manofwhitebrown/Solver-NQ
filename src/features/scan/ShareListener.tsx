import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui';
import { isNative } from '@/lib/ocr/platform';
import { onSharedImage, takeSharedImage } from './shareTarget';

/** Android only: when a photo is shared to the app, open /scan with it (once). Renders nothing. */
export function ShareListener() {
  const nav = useNavigate();
  useEffect(() => {
    if (!isNative()) return;
    const check = async () => {
      const r = await takeSharedImage();
      if (!r) return;
      if (r.blob) nav('/scan', { state: { sharedImage: r.blob } });
      else toast(r.error === 'too-large' ? 'That image is over 25 MB. Choose a smaller one.' : 'Could not read the shared image.', 'error');
    };
    void check();
    return onSharedImage(() => { void check(); });
  }, [nav]);
  return null;
}
