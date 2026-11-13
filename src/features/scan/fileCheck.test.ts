import { describe, expect, it } from 'vitest';
import { friendlyMessage, OcrError } from '@/lib/ocr';
import { fileKind } from './fileCheck';

const file = (name: string, type: string) => new File(['x'], name, { type });

describe('fileKind (file picker, item 7b)', () => {
  it('rejects a .txt file', () => {
    expect(fileKind(file('notes.txt', 'text/plain'))).toBe('unsupported');
  });
  it('rejects a file with an empty type and no known extension', () => {
    expect(fileKind(file('mystery', ''))).toBe('unsupported');
    expect(fileKind(file('data.xyz', ''))).toBe('unsupported');
    expect(fileKind(new Blob(['x']))).toBe('unsupported');
  });
  it('recognises HEIC by type or by name when the type is empty', () => {
    expect(fileKind(file('IMG_1.HEIC', 'image/heic'))).toBe('heic');
    expect(fileKind(file('IMG_1.heif', 'image/heif'))).toBe('heic');
    expect(fileKind(file('IMG_1.heic', ''))).toBe('heic');
  });
  it('still accepts normal photos and PDFs, including a photo with an empty type', () => {
    expect(fileKind(file('a.jpg', 'image/jpeg'))).toBe('image');
    expect(fileKind(file('a.png', 'image/png'))).toBe('image');
    expect(fileKind(file('scan.jpeg', ''))).toBe('image');
    expect(fileKind(file('a.pdf', 'application/pdf'))).toBe('pdf');
    expect(fileKind(file('a.pdf', 'application/octet-stream'))).toBe('pdf');
  });
  it('each rejection has a clear message that names what to do', () => {
    expect(friendlyMessage(new OcrError('unsupported'))).toMatch(/JPG, PNG, WebP.*PDF/);
    expect(friendlyMessage(new OcrError('heic'))).toMatch(/HEIC.*JPG/);
  });
});
