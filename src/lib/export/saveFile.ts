import { Capacitor } from '@capacitor/core';

export type SaveOutcome = 'saved' | 'shared' | 'cancelled';

/** Android/iOS file names: no path separators or characters the file system dislikes. */
export function safeName(name: string): string {
  const noCtl = [...name].filter((c) => c.charCodeAt(0) >= 32).join('');
  const clean = noCtl.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
  return (clean || 'export').slice(0, 120);
}

/** Base64 in 32 kB chunks so a big PDF never builds one giant string of char codes. */
export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

const isCancel = (e: unknown) => /cancel/i.test(String((e as { message?: string })?.message ?? e));

async function saveNative(blob: Blob, filename: string): Promise<SaveOutcome> {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);
  const name = safeName(filename);
  // Cache dir: no storage permission needed, and the share sheet can read it through the app's FileProvider.
  const written = await Filesystem.writeFile({ path: name, data: await blobToBase64(blob), directory: Directory.Cache });
  try {
    const can = await Share.canShare();
    if (!can.value) return 'saved'; // file is written; nothing else to open
    await Share.share({ title: name, url: written.uri, dialogTitle: 'Save or send' });
    return 'shared';
  } catch (e) {
    if (isCancel(e)) return 'cancelled'; // the user closed the share sheet: not an error
    throw e;
  }
}

function saveWeb(blob: Blob, filename: string): SaveOutcome {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'saved';
}

/** Web: normal download. Android: write to the cache folder, then open the share sheet. */
export async function saveFile(blob: Blob, filename: string): Promise<SaveOutcome> {
  return Capacitor.isNativePlatform() ? saveNative(blob, filename) : saveWeb(blob, filename);
}
