// What kind of file did the picker give us? Pure, so it can be unit tested without a browser.
// Some Android pickers hand over photos with an empty or generic type, so fall back to the file extension.
export type FileKind = 'pdf' | 'image' | 'heic' | 'unsupported';

const BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
  heic: 'image/heic', heif: 'image/heif', pdf: 'application/pdf',
};

export function fileKind(f: { type: string; name?: string }): FileKind {
  let t = (f.type || '').toLowerCase();
  if (!t || t === 'application/octet-stream') {
    const ext = f.name?.includes('.') ? f.name.split('.').pop()!.toLowerCase() : '';
    t = BY_EXT[ext] ?? '';
  }
  if (t === 'application/pdf') return 'pdf';
  if (/^image\/hei[cf]/.test(t)) return 'heic';
  if (/^image\/(jpe?g|png|webp|gif|bmp)$/.test(t)) return 'image';
  return 'unsupported';
}
