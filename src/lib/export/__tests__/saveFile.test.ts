import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  native: true,
  writeFile: vi.fn(async (_o: unknown) => ({ uri: 'file:///cache/x.pdf' })),
  share: vi.fn(async (_o: unknown) => ({})),
  canShare: vi.fn(async () => ({ value: true })),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => h.native } }));
vi.mock('@capacitor/filesystem', () => ({ Filesystem: { writeFile: h.writeFile }, Directory: { Cache: 'CACHE' } }));
vi.mock('@capacitor/share', () => ({ Share: { share: h.share, canShare: h.canShare } }));

import { safeName, saveFile } from '../saveFile';

const blob = new Blob(['hello'], { type: 'application/pdf' });

beforeEach(() => {
  h.native = true;
  h.writeFile.mockClear(); h.share.mockClear(); h.canShare.mockClear();
  h.canShare.mockResolvedValue({ value: true });
  h.share.mockResolvedValue({});
});

describe('safeName', () => {
  it('removes path separators and odd characters', () => {
    expect(safeName('Math/Algebra: x?.pdf')).toBe('Math-Algebra- x-.pdf');
    expect(safeName('   ')).toBe('export');
  });
});

describe('saveFile on Android', () => {
  it('writes to the cache dir as base64, then shares the file uri', async () => {
    expect(await saveFile(blob, 'Math - Quadratics.pdf')).toBe('shared');
    expect(h.writeFile).toHaveBeenCalledWith({ path: 'Math - Quadratics.pdf', data: 'aGVsbG8=', directory: 'CACHE' });
    expect(h.share).toHaveBeenCalledWith(expect.objectContaining({ url: 'file:///cache/x.pdf' }));
  });
  it('treats a closed share sheet as cancelled, not as an error', async () => {
    h.share.mockRejectedValueOnce(new Error('Share canceled'));
    expect(await saveFile(blob, 'a.pdf')).toBe('cancelled');
  });
  it('rethrows real share errors', async () => {
    h.share.mockRejectedValueOnce(new Error('boom'));
    await expect(saveFile(blob, 'a.pdf')).rejects.toThrow('boom');
  });
  it('still reports saved when sharing is not available', async () => {
    h.canShare.mockResolvedValueOnce({ value: false });
    expect(await saveFile(blob, 'a.pdf')).toBe('saved');
    expect(h.share).not.toHaveBeenCalled();
  });
  it('lets a write failure surface', async () => {
    h.writeFile.mockRejectedValueOnce(new Error('disk full'));
    await expect(saveFile(blob, 'a.pdf')).rejects.toThrow('disk full');
  });
});

describe('saveFile on web', () => {
  it('clicks a download link and never touches the plugins', async () => {
    h.native = false;
    const click = vi.fn();
    const link = { click, remove: vi.fn(), href: '', download: '' };
    vi.stubGlobal('document', { createElement: () => link, body: { appendChild: vi.fn() } });
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL: vi.fn() });
    expect(await saveFile(blob, 'a.pdf')).toBe('saved');
    expect(click).toHaveBeenCalled();
    expect(link.download).toBe('a.pdf');
    expect(h.writeFile).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
